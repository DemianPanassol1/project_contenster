import type { AppOption, PaginatedBody } from '@contenster/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { EntityManager } from 'typeorm';

import type { I18nTranslations } from '@/i18n/translations';
import { FunctionalityService } from '@/modules/core/access-control/functionalities/functionality.service';
import { SessionSynchronizationService } from '@/modules/core/identity/authentication/session/session-synchronization.service';
import { ActionsService } from '@/modules/core/system-admin/actions/actions.service';
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

import type { SaveProfileRequestDto } from './dto/req/save-profile-request.js';
import { GetProfileByIdResponseDto } from './dto/res/get-profile-by-id-response.js';
import { ProfileListItemResponseDto } from './dto/res/profile-list-item-response.js';
import type { Profile } from './entities/profiles.entity';
import type { SaveAdminProfileInTransactionInput } from './types/save-admin-profile-in-transaction.input';
import { ProfilesRepository } from './profiles.repository';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly repository: ProfilesRepository,
    private readonly functionalityService: FunctionalityService,
    private readonly actionsService: ActionsService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<ProfileListItemResponseDto>> {
    const locale = getCurrentLocale();
    const [profiles, total] = await this.repository.list(clientId, request, locale);
    return {
      items: toResponseDto(
        ProfileListItemResponseDto,
        profiles.map((profile) => this.toListItem(profile, locale)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listFunctionalityOptions(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [functionalities] = await this.functionalityService.listEntities(
      clientId,
      request,
      locale,
    );

    return functionalities.map((functionality) => ({
      disabled: !functionality.isActive,
      label: resolveTranslation(functionality.translations, locale, 'name'),
      metadata: null,
      value: functionality.id,
    }));
  }

  async listActionOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const locale = getCurrentLocale();
    const [actions] = await this.actionsService.listEntities(request, locale);

    return actions.map((action) => ({
      disabled: null,
      label: resolveTranslation(action.translations, locale, 'name'),
      metadata: null,
      value: action.id,
    }));
  }

  async getById(clientId: number, id: number): Promise<GetProfileByIdResponseDto> {
    const profile = await this.getEntityByIdOrFail(clientId, id);
    const locale = getCurrentLocale();

    return toResponseDto(GetProfileByIdResponseDto, {
      ...this.toListItem(profile, locale),
      translations: profile.translations.map((translation) => ({
        id: translation.id,
        locale: translation.language.languageCode,
        name: translation.name,
        description: translation.description,
      })),
      permissions: profile.permissions.map((permission) => ({
        id: permission.id,
        functionalityId: permission.functionality.id,
        actionId: permission.action.id,
      })),
    });
  }

  findAssignableProfile(clientId: number, id: number, manager?: EntityManager) {
    return this.repository.findById(clientId, id, manager);
  }

  listEntities(clientId: number, request: PaginateRequestDto, locale: string) {
    return this.repository.list(clientId, request, locale);
  }

  async save(clientId: number, request: SaveProfileRequestDto): Promise<GetProfileByIdResponseDto> {
    let existingProfile: Profile | null = null;

    if (request.id !== null) {
      existingProfile = await this.getEntityByIdOrFail(clientId, request.id);

      if (existingProfile.isAdmin) {
        const currentPermissionKeys = existingProfile.permissions
          .map((permission) => `${permission.functionality.id}:${permission.action.id}`)
          .sort();
        const requestedPermissionKeys = request.permissions
          .map((permission) => `${permission.functionalityId}:${permission.actionId}`)
          .sort();

        if (
          !request.isActive ||
          currentPermissionKeys.length !== requestedPermissionKeys.length ||
          currentPermissionKeys.some((key, index) => key !== requestedPermissionKeys[index])
        ) {
          throw new ConflictException(this.i18n.t('errors.access_control.admin_profile_immutable'));
        }
      }
    }

    const languageByCode = resolveTranslationLanguages(
      request.translations.map((translation) => translation.locale),
      await this.repository.findLanguagesByCodes(
        request.translations.map((translation) => translation.locale),
      ),
    );
    const functionalityIds = request.permissions.map((permission) => permission.functionalityId);

    const functionalities = await this.functionalityService.findByIds(clientId, functionalityIds);

    if (functionalities.length !== new Set(functionalityIds).size) {
      throw new BadRequestException(
        this.i18n.t('errors.access_control.profile_functionality_not_found'),
      );
    }

    const actionIds = request.permissions.map((permission) => permission.actionId);
    const permissionKeys = request.permissions.map(
      (permission) => `${permission.functionalityId}:${permission.actionId}`,
    );

    if (new Set(permissionKeys).size !== permissionKeys.length) {
      throw new BadRequestException(
        this.i18n.t('errors.access_control.profile_permission_duplicate'),
      );
    }

    const actions = await this.actionsService.findByIds(actionIds);

    if (actions.length !== new Set(actionIds).size) {
      throw new BadRequestException(this.i18n.t('errors.access_control.profile_action_not_found'));
    }

    const functionalityById = new Map(
      functionalities.map((functionality) => [functionality.id, functionality]),
    );
    const actionById = new Map(actions.map((action) => [action.id, action]));

    const profile = await this.repository.save({
      ...(request.id === null ? {} : { id: request.id }),
      client: { id: clientId },
      isActive: request.isActive,
      translations: request.translations.map((translation) => ({
        ...(translation.id === null ? {} : { id: translation.id }),
        language: languageByCode.get(translation.locale)!,
        name: translation.name,
        description: translation.description,
      })),
      permissions: request.permissions.map((permission) => ({
        ...(permission.id === null ? {} : { id: permission.id }),
        functionality: functionalityById.get(permission.functionalityId)!,
        action: actionById.get(permission.actionId)!,
      })),
    });

    await this.sessionSynchronizationService.synchronizeAll();

    return this.getById(clientId, profile.id);
  }

  async saveAdminProfileInTransaction(
    input: SaveAdminProfileInTransactionInput,
    manager: EntityManager,
  ): Promise<Profile> {
    const profiles = await this.repository.findActiveAdminByClientId(input.clientId, manager);

    if (profiles.length > 1) {
      throw new BadRequestException(this.i18n.t('errors.access_models.admin_profile_invalid'));
    }

    const locales = input.translations.map((translation) => translation.locale);
    const languages = await this.repository.findLanguagesByCodesInTransaction(locales, manager);
    const languageByCode = resolveTranslationLanguages(locales, languages);
    const profile = profiles[0] ?? null;

    return this.repository.saveInTransaction(
      {
        ...(profile === null ? {} : { id: profile.id }),
        client: { id: input.clientId },
        isActive: true,
        isAdmin: true,
        translations: input.translations.map((translation) => ({
          ...(profile?.translations.find(
            (item) => item.language.languageCode === translation.locale,
          ) ?? {}),
          ...translation,
          language: languageByCode.get(translation.locale)!,
        })),
      },
      manager,
    );
  }

  async delete(
    clientId: number,
    request: DeleteRecordsRequestDto,
  ): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const profiles = await this.repository.findByIds(clientId, ids);

    if (profiles.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    if (profiles.some((profile) => profile.isAdmin)) {
      throw new ConflictException(
        this.i18n.t('errors.access_control.admin_profile_cannot_be_deleted'),
      );
    }

    if (await this.repository.hasUsers(ids)) {
      throw new ConflictException(this.i18n.t('errors.access_control.profile_has_users'));
    }

    const result = await this.repository.delete(profiles);

    await this.sessionSynchronizationService.synchronizeAll();

    return toResponseDto(DeleteRecordsResponseDto, { ids: result });
  }

  private async getEntityByIdOrFail(clientId: number, id: number): Promise<Profile> {
    const profile = await this.repository.findById(clientId, id);
    if (!profile) {
      throw new NotFoundException(this.i18n.t('errors.access_control.profile_not_found'));
    }

    return profile;
  }

  private toListItem(profile: Profile, locale: string) {
    return {
      id: profile.id,
      isAdmin: profile.isAdmin,
      isActive: profile.isActive,
      name: resolveTranslation(profile.translations, locale, 'name'),
      description: resolveTranslation(profile.translations, locale, 'description'),
    };
  }
}
