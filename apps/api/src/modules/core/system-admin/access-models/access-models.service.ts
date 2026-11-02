import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DataSource } from 'typeorm';

import {
  type AccessModelListResponse,
  type AccessModelPreviewChange,
  type AccessModelPreviewConflict,
  type AccessModelPreviewResponse,
  type ApplyAccessModelResponse,
  isFunctionalitySlug,
  parseAccessModelStructure,
  type SaveAccessModelRequest,
} from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { SessionSynchronizationService } from '@/modules/core/identity/authentication/session/session-synchronization.service';
import {
  type DeleteRecordsRequestDto,
  DeleteRecordsResponseDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation, resolveTranslationLanguages } from '@/shared/translations';

import { AccessModel } from './entities/access-model.entity';
import { AccessModelsRepository } from './access-models.repository';

@Injectable()
export class AccessModelsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly repository: AccessModelsRepository,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(request: PaginateRequestDto): Promise<AccessModelListResponse> {
    const [models, total] = await this.repository.list(request);
    const locale = getCurrentLocale();

    return {
      items: models.map((model) => this.toListItem(model, locale)),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number) {
    return this.toDetail(await this.getOrFail(id));
  }

  async save(
    request: SaveAccessModelRequest,
  ): Promise<ReturnType<AccessModelsService['toDetail']>> {
    return this.dataSource.transaction(async (manager) => {
      const current =
        request.id === null ? null : await this.repository.findById(request.id, manager);

      if (request.id !== null && !current) {
        throw new NotFoundException(this.i18n.t('errors.access_models.not_found'));
      }

      const languages = await this.repository.findLanguagesByCodes(
        request.translations.map(({ locale }) => locale),
        manager,
      );
      const languageByCode = resolveTranslationLanguages(
        request.translations.map(({ locale }) => locale),
        languages,
      );
      const structure = this.normalizeStructure(request.structure, current?.structure);

      const structureLocales = [
        ...new Set(
          structure.modules.flatMap((module) => [
            ...module.translations.map((item) => item.locale),
            ...module.functionalities.flatMap((item) =>
              item.translations.map((translation) => translation.locale),
            ),
          ]),
        ),
      ];
      const structureLanguages = await this.repository.findLanguagesByCodes(
        structureLocales,
        manager,
      );

      if (structureLanguages.length !== structureLocales.length) {
        throw new BadRequestException(this.i18n.t('errors.access_models.invalid_structure'));
      }

      const translationIds = new Set(current?.translations.map((item) => item.id) ?? []);

      if (request.translations.some((item) => item.id !== null && !translationIds.has(item.id))) {
        throw new BadRequestException(this.i18n.t('errors.access_models.invalid_structure'));
      }

      const model = await this.repository.save(
        {
          ...(current ? { id: current.id } : {}),
          isActive: request.isActive,
          structure,
          translations: request.translations.map((translation) => ({
            ...(translation.id === null ? {} : { id: translation.id }),
            language: languageByCode.get(translation.locale)!,
            name: translation.name,
            description: translation.description,
          })),
        },
        manager,
      );

      return this.toDetail((await this.repository.findById(model.id, manager))!);
    });
  }

  async delete(request: DeleteRecordsRequestDto): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(
      request,
      this.i18n.t('errors.access_models.invalid_delete'),
    );
    const models = await this.repository.findByIds(ids);

    if (models.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.access_models.not_found'));
    }

    return toResponseDto(DeleteRecordsResponseDto, { ids: await this.repository.delete(models) });
  }

  async preview(modelId: number, clientId: number): Promise<AccessModelPreviewResponse> {
    const model = await this.getOrFail(modelId);

    if (!model.isActive) {
      throw new BadRequestException(this.i18n.t('errors.access_models.inactive'));
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const state = await this.repository.loadClientState(manager, clientId);
      const changes = this.plan(model, state);

      const conflicts: AccessModelPreviewConflict[] =
        state.profiles.filter((profile) => profile.isAdmin && !profile.isActive).length ||
        state.profiles.filter((profile) => profile.isAdmin).length !== 1
          ? [
              {
                code: 'admin_profile_invalid' as const,
                message: this.i18n.t('errors.access_models.admin_profile_invalid'),
              },
            ]
          : [];
      const enabled = new Set(state.languages.map((link) => link.language.languageCode));

      for (const module of model.structure.modules) {
        if (!module.translations.some((translation) => enabled.has(translation.locale))) {
          conflicts.push({
            code: 'missing_enabled_translation',
            message: this.i18n.t('errors.access_models.module_translation_missing'),
          });
        }

        for (const item of module.functionalities) {
          if (
            !item.translations.some((translation) => enabled.has(translation.locale)) ||
            !item.enabledLanguageCodes.some((code) => enabled.has(code))
          ) {
            conflicts.push({
              code: 'missing_enabled_translation',
              message: this.i18n.t('errors.access_models.functionality_translation_missing'),
            });
          }
        }
      }

      return { fingerprint: this.fingerprint(model, state), changes, conflicts };
    });

    return result;
  }

  async apply(
    modelId: number,
    clientId: number,
    fingerprint: string,
    selectedChangeIds: string[],
  ): Promise<ApplyAccessModelResponse> {
    const result = await this.dataSource.transaction(async (manager) => {
      await this.repository.lockSynchronization(manager);

      const model = await this.repository.findById(modelId, manager);

      if (!model) {
        throw new NotFoundException(this.i18n.t('errors.access_models.not_found'));
      }

      if (!model.isActive) {
        throw new ConflictException(this.i18n.t('errors.access_models.inactive'));
      }

      const state = await this.repository.loadClientState(manager, clientId);
      const changes = this.plan(model, state);

      if (fingerprint !== this.fingerprint(model, state)) {
        throw new ConflictException(this.i18n.t('errors.access_models.stale_preview'));
      }

      if (state.profiles.filter((profile) => profile.isAdmin && profile.isActive).length !== 1) {
        throw new ConflictException(this.i18n.t('errors.access_models.admin_profile_invalid'));
      }

      const selected = new Set(selectedChangeIds);

      if (
        selected.size !== selectedChangeIds.length ||
        [...selected].some((id) => !changes.some((change) => change.id === id))
      ) {
        throw new BadRequestException(this.i18n.t('errors.access_models.invalid_selection'));
      }

      const finalModules = new Map(state.modules.map((item) => [item.key, item.key]));
      const finalFunctionalities = new Map(
        state.functionalities.map((item) => [
          item.slug,
          { moduleKey: item.module.key, parentSlug: item.parent?.slug ?? null },
        ]),
      );
      const removedIds = new Set<number>();

      for (const module of state.modules) {
        if (selected.has(`delete-module:${module.id}`)) {
          finalModules.delete(module.key);
        }
      }

      for (const module of model.structure.modules) {
        if (selected.has(`module:${module.key}`)) {
          finalModules.set(module.key!, module.key!);
        }

        for (const item of module.functionalities) {
          if (selected.has(`functionality:${item.slug}`)) {
            finalFunctionalities.set(item.slug, {
              moduleKey: module.key!,
              parentSlug: item.parentSlug,
            });
          }
        }
      }

      for (const item of state.functionalities) {
        const final = finalFunctionalities.get(item.slug)!;

        if (selected.has(`delete-functionality:${item.id}`) || !finalModules.has(final.moduleKey)) {
          removedIds.add(item.id);
          finalFunctionalities.delete(item.slug);
        }
      }

      for (const [slug, item] of finalFunctionalities) {
        if (!finalModules.has(item.moduleKey)) {
          throw new ConflictException(this.i18n.t('errors.access_models.module_not_selected'));
        }

        const visited = new Set([slug]);
        let parentSlug = item.parentSlug;
        while (parentSlug) {
          const parent = finalFunctionalities.get(parentSlug);

          if (!parent || parent.moduleKey !== item.moduleKey || visited.has(parentSlug)) {
            throw new ConflictException(this.i18n.t('errors.access_models.invalid_hierarchy'));
          }
          visited.add(parentSlug);
          parentSlug = parent.parentSlug;
        }
      }

      const result = {
        createdFunctionalities: 0,
        createdModules: 0,
        deletedFunctionalities: 0,
        deletedModules: 0,
        updatedFunctionalities: 0,
        updatedModules: 0,
      };

      const enabled = new Set(state.languages.map((link) => link.language.languageCode));
      const languageByCode = new Map(
        state.languages.map((link) => [link.language.languageCode, link.language]),
      );
      const modules = new Map(state.modules.map((module) => [module.key, module]));
      const functionalities = new Map(
        state.functionalities.map((functionality) => [functionality.slug, functionality]),
      );

      for (const definition of model.structure.modules) {
        const changeId = `module:${definition.key}`;

        if (!selected.has(changeId)) {
          continue;
        }

        const translations = definition.translations.filter((item) => enabled.has(item.locale));

        if (!translations.length) {
          throw new ConflictException(
            this.i18n.t('errors.access_models.module_translation_missing'),
          );
        }

        const existing = modules.get(definition.key!);
        const translationByLanguageId = new Map(
          existing?.translations.map((item) => [item.language.id, item]) ?? [],
        );

        const saved = await this.repository.saveModule(
          {
            ...(existing ? { id: existing.id } : {}),
            client: { id: clientId },
            key: definition.key!,
            order: definition.order,
            isActive: definition.isActive,
            translations: translations.map((item) => {
              const language = languageByCode.get(item.locale)!;
              const existingTranslation = translationByLanguageId.get(language.id);

              return {
                ...(existingTranslation ? { id: existingTranslation.id } : {}),
                language,
                name: item.name,
                description: item.description,
              };
            }),
          },
          manager,
        );
        modules.set(definition.key!, saved);
        if (existing) {
          result.updatedModules++;
        } else {
          result.createdModules++;
        }
      }

      for (const definition of model.structure.modules.flatMap((module) =>
        module.functionalities.map((functionality) => ({ functionality, module })),
      )) {
        const changeId = `functionality:${definition.functionality.slug}`;

        if (!selected.has(changeId)) {
          continue;
        }

        const module = modules.get(definition.module.key!);

        if (!module) {
          throw new ConflictException(this.i18n.t('errors.access_models.module_not_selected'));
        }

        const translations = definition.functionality.translations.filter((item) =>
          enabled.has(item.locale),
        );
        if (!translations.length) {
          throw new ConflictException(
            this.i18n.t('errors.access_models.functionality_translation_missing'),
          );
        }

        const enabledCodes = definition.functionality.enabledLanguageCodes.filter((code) =>
          enabled.has(code),
        );
        if (!enabledCodes.length) {
          throw new ConflictException(
            this.i18n.t('errors.access_models.functionality_translation_missing'),
          );
        }

        const existing = functionalities.get(definition.functionality.slug);
        const translationByLanguageId = new Map(
          existing?.translations.map((item) => [item.language.id, item]) ?? [],
        );
        const linkByLanguageId = new Map(
          existing?.enabledLanguageLinks.map((item) => [item.language.id, item]) ?? [],
        );
        const saved = await this.repository.saveFunctionality(
          {
            ...(existing ? { id: existing.id } : {}),
            client: { id: clientId },
            module: { id: module.id },
            parent: null,
            slug: definition.functionality.slug,
            icon: definition.functionality.icon,
            order: definition.functionality.order,
            isNavigationGroup: definition.functionality.isNavigationGroup,
            isActive: definition.functionality.isActive,
            translations: translations.map((item) => {
              const language = languageByCode.get(item.locale)!;
              const existingTranslation = translationByLanguageId.get(language.id);

              return {
                ...(existingTranslation ? { id: existingTranslation.id } : {}),
                language,
                name: item.name,
                description: item.description,
              };
            }),
            enabledLanguageLinks: enabledCodes.map((code) => {
              const language = languageByCode.get(code)!;
              const existingLink = linkByLanguageId.get(language.id);

              return {
                ...(existingLink ? { id: existingLink.id } : {}),
                client: { id: clientId },
                language,
              };
            }),
          },
          manager,
        );

        functionalities.set(saved.slug, saved);

        if (existing) {
          result.updatedFunctionalities++;
        } else {
          result.createdFunctionalities++;
        }
      }

      for (const definition of model.structure.modules.flatMap(
        (module) => module.functionalities,
      )) {
        if (!selected.has(`functionality:${definition.slug}`)) {
          continue;
        }

        const functionality = functionalities.get(definition.slug);
        const parent = definition.parentSlug ? functionalities.get(definition.parentSlug) : null;

        if (!functionality || (definition.parentSlug && !parent)) {
          throw new ConflictException(this.i18n.t('errors.access_models.parent_unavailable'));
        }

        await this.repository.saveFunctionality(
          { id: functionality.id, parent: parent ? { id: parent.id } : null },
          manager,
        );
      }

      for (const change of changes.filter(
        (change) => selected.has(change.id) && change.kind === 'delete_functionality',
      )) {
        const functionality = state.functionalities.find(
          (item) => `delete-functionality:${item.id}` === change.id,
        );

        if (functionality) {
          await this.repository.removeFunctionalities([functionality], manager);
          functionalities.delete(functionality.slug);
          result.deletedFunctionalities++;
        }
      }

      for (const change of changes.filter(
        (change) => selected.has(change.id) && change.kind === 'delete_module',
      )) {
        const module = state.modules.find((item) => `delete-module:${item.id}` === change.id);

        if (module) {
          result.deletedFunctionalities += state.functionalities.filter(
            (item) => item.module.id === module.id && removedIds.has(item.id),
          ).length;
          await this.repository.removeModules([module], manager);
          modules.delete(module.key);
          result.deletedModules++;
        }
      }

      const adminProfile = state.profiles.find((profile) => profile.isAdmin)!;
      const relevant = [...functionalities.values()].filter(
        (item) => selected.has(`functionality:${item.slug}`) && !removedIds.has(item.id),
      );
      const actions = await this.repository.findActions(manager);
      const permissions = await this.repository.findPermissions(adminProfile.id, manager);
      const existingPermissionKeys = new Set(
        permissions.map((item) => `${item.functionality.id}:${item.action.id}`),
      );
      const missing = relevant.flatMap((functionality) =>
        actions
          .filter((action) => !existingPermissionKeys.has(`${functionality.id}:${action.id}`))
          .map((action) => ({ profile: adminProfile, functionality, action })),
      );
      if (missing.length) {
        await this.repository.savePermissions(missing, manager);
      }

      return result;
    });

    await this.sessionSynchronizationService.synchronizeAll();

    return result;
  }

  private async getOrFail(id: number): Promise<AccessModel> {
    const model = await this.repository.findById(id);

    if (!model) {
      throw new NotFoundException(this.i18n.t('errors.access_models.not_found'));
    }

    return model;
  }

  private normalizeStructure(
    structure: SaveAccessModelRequest['structure'],
    current: SaveAccessModelRequest['structure'] | undefined,
  ) {
    try {
      structure = parseAccessModelStructure(structure);
    } catch {
      throw new BadRequestException(this.i18n.t('errors.access_models.invalid_structure'));
    }

    if (!structure || !Array.isArray(structure.modules)) {
      throw new BadRequestException(this.i18n.t('errors.access_models.invalid_structure'));
    }

    const slugs = new Set<string>();

    for (const module of structure.modules) {
      if (
        !Array.isArray(module.translations) ||
        !module.translations.length ||
        !Array.isArray(module.functionalities)
      ) {
        throw new BadRequestException(this.i18n.t('errors.access_models.invalid_module'));
      }

      const definitions = new Map(module.functionalities.map((item) => [item.slug, item]));

      for (const functionality of module.functionalities) {
        if (!isFunctionalitySlug(functionality.slug) || slugs.has(functionality.slug)) {
          throw new BadRequestException(this.i18n.t('errors.access_models.invalid_functionality'));
        }
        slugs.add(functionality.slug);
        const visited = new Set<string>([functionality.slug]);
        let parentSlug = functionality.parentSlug;

        while (parentSlug) {
          if (visited.has(parentSlug) || !definitions.has(parentSlug)) {
            throw new BadRequestException(this.i18n.t('errors.access_models.invalid_hierarchy'));
          }
          visited.add(parentSlug);
          parentSlug = definitions.get(parentSlug)!.parentSlug;
        }
      }
    }

    const currentKeys = new Set(current?.modules.map((module) => module.key).filter(Boolean) ?? []);
    const keys = new Set<string>();

    return {
      modules: structure.modules.map((module) => {
        if (module.key !== null && !currentKeys.has(module.key)) {
          throw new BadRequestException(this.i18n.t('errors.access_models.invalid_structure'));
        }

        const key =
          module.key && currentKeys.has(module.key) ? module.key : this.createModuleKey(keys);
        if (keys.has(key)) {
          throw new BadRequestException(this.i18n.t('errors.access_models.duplicate_module_key'));
        }
        keys.add(key);
        return { ...module, key };
      }),
    };
  }

  private createModuleKey(keys: Set<string>): string {
    let key = '';

    do {
      key = `MOD_${randomBytes(5).toString('hex').toUpperCase().slice(0, 8)}`;
    } while (keys.has(key));
    return key;
  }

  private fingerprint(model: AccessModel, state: unknown): string {
    const canonical = (value: unknown): unknown => {
      if (value instanceof Date) {
        return value.toISOString();
      }

      if (Array.isArray(value)) {
        return value
          .map(canonical)
          .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
      }

      if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, item]) => [key, canonical(item)]),
        );
      }

      return value;
    };

    return createHash('sha256')
      .update(
        JSON.stringify(
          canonical({
            id: model.id,
            structure: model.structure,
            updatedAt: model.updatedAt.toISOString(),
            state,
          }),
        ),
      )
      .digest('hex');
  }

  private plan(
    model: AccessModel,
    state: Awaited<ReturnType<AccessModelsRepository['loadClientState']>>,
  ): AccessModelPreviewChange[] {
    const locale = getCurrentLocale();
    const enabled = new Set(state.languages.map((link) => link.language.languageCode));
    const normalizedTranslations = (
      items: Array<{ locale: string; name: string; description: string | null }>,
    ) =>
      items
        .filter((item) => enabled.has(item.locale))
        .map((item) => ({ locale: item.locale, name: item.name, description: item.description }))
        .sort((a, b) => a.locale.localeCompare(b.locale));
    const plannedKeys = new Set(model.structure.modules.map((module) => module.key));
    const plannedSlugs = new Set(
      model.structure.modules.flatMap((module) => module.functionalities.map((item) => item.slug)),
    );
    const changes: AccessModelPreviewChange[] = [];

    for (const definition of model.structure.modules) {
      const current = state.modules.find((module) => module.key === definition.key);
      const proposedValue = {
        order: definition.order,
        isActive: definition.isActive,
        translations: normalizedTranslations(definition.translations),
      };

      const currentValue = current
        ? {
            order: current.order,
            isActive: current.isActive,
            translations: normalizedTranslations(
              current.translations.map((item) => ({
                locale: item.language.languageCode,
                name: item.name,
                description: item.description,
              })),
            ),
          }
        : null;
      if (JSON.stringify(proposedValue) !== JSON.stringify(currentValue)) {
        changes.push({
          id: `module:${definition.key}`,
          kind: current ? 'update_module' : 'create_module',
          label: resolveTranslation(definition.translations, locale, 'name'),
          description: null,
          affectedItems: [],
          currentValue: JSON.stringify(currentValue, null, 2),
          proposedValue: JSON.stringify(proposedValue, null, 2),
        });
      }

      for (const item of definition.functionalities) {
        const existing = state.functionalities.find((entry) => entry.slug === item.slug);
        const proposed = {
          moduleKey: definition.key,
          parentSlug: item.parentSlug,
          icon: item.icon,
          order: item.order,
          isActive: item.isActive,
          isNavigationGroup: item.isNavigationGroup,
          enabledLanguageCodes: item.enabledLanguageCodes
            .filter((code) => enabled.has(code))
            .sort(),
          translations: normalizedTranslations(item.translations),
        };

        const before = existing
          ? {
              moduleKey: existing.module.key,
              parentSlug: existing.parent?.slug ?? null,
              icon: existing.icon,
              order: existing.order,
              isActive: existing.isActive,
              isNavigationGroup: existing.isNavigationGroup,
              enabledLanguageCodes: existing.enabledLanguageLinks
                .map((link) => link.language.languageCode)
                .sort(),
              translations: normalizedTranslations(
                existing.translations.map((translation) => ({
                  locale: translation.language.languageCode,
                  name: translation.name,
                  description: translation.description,
                })),
              ),
            }
          : null;
        const admin = state.profiles.find((profile) => profile.isAdmin);
        const missingPermissions =
          existing &&
          state.actions.some(
            (action) =>
              !admin?.permissions.some(
                (permission) =>
                  permission.functionality.id === existing.id && permission.action.id === action.id,
              ),
          );
        if (JSON.stringify(proposed) !== JSON.stringify(before) || missingPermissions) {
          changes.push({
            id: `functionality:${item.slug}`,
            kind: existing ? 'update_functionality' : 'create_functionality',
            label: resolveTranslation(item.translations, locale, 'name'),
            description: null,
            affectedItems: [],
            currentValue: JSON.stringify(before, null, 2),
            proposedValue: JSON.stringify(
              { ...proposed, synchronizeAdminPermissions: Boolean(missingPermissions) },
              null,
              2,
            ),
          });
        }
      }
    }

    for (const module of state.modules) {
      if (!plannedKeys.has(module.key)) {
        changes.push({
          id: `delete-module:${module.id}`,
          kind: 'delete_module',
          label: resolveTranslation(module.translations, locale, 'name'),
          description: null,
          affectedItems: state.functionalities
            .filter((item) => item.module.id === module.id)
            .map((item) => resolveTranslation(item.translations, locale, 'name')),
        });
      }
    }

    for (const item of state.functionalities) {
      if (!plannedSlugs.has(item.slug) && plannedKeys.has(item.module.key)) {
        changes.push({
          id: `delete-functionality:${item.id}`,
          kind: 'delete_functionality',
          label: resolveTranslation(item.translations, locale, 'name'),
          description: null,
          affectedItems: state.functionalities
            .filter((child) => child.parent?.id === item.id)
            .map((child) => resolveTranslation(child.translations, locale, 'name')),
        });
      }
    }

    const moduleNames = new Map<string, string>([
      ...state.modules.map(
        (module) => [module.key, resolveTranslation(module.translations, locale, 'name')] as const,
      ),
      ...model.structure.modules.map(
        (module) => [module.key!, resolveTranslation(module.translations, locale, 'name')] as const,
      ),
    ]);
    const present = (value: string) =>
      JSON.stringify(
        JSON.parse(value) as unknown,
        (key: string, entry: unknown) =>
          key === 'moduleKey' && typeof entry === 'string'
            ? (moduleNames.get(entry) ?? '—')
            : entry,
        2,
      );
    return changes.map((change) => ({
      ...change,
      ...(change.currentValue === undefined ? {} : { currentValue: present(change.currentValue) }),
      ...(change.proposedValue === undefined
        ? {}
        : { proposedValue: present(change.proposedValue) }),
    }));
  }

  private toListItem(model: AccessModel, locale: string) {
    const translation = resolveTranslation(model.translations, locale, 'name');

    return {
      id: model.id,
      isActive: model.isActive,
      name: translation,
      description: resolveTranslation(model.translations, locale, 'description'),
      updatedAt: model.updatedAt.toISOString(),
    };
  }

  private toDetail(model: AccessModel) {
    return {
      ...this.toListItem(model, getCurrentLocale()),
      structure: model.structure,
      translations: model.translations.map((translation) => ({
        id: translation.id,
        locale: translation.language.languageCode,
        name: translation.name,
        description: translation.description,
      })),
    };
  }
}
