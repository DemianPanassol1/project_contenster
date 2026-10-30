import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, type DeepPartial, In, Repository } from 'typeorm';

import {
  CORE_FUNCTIONALITY_CATALOG,
  type CreateSystemAdminClientRequest,
  type CronExecutionLogListItem,
  type PaginatedBody,
  type PaginateRequest,
  type SystemAdminAccessLinkRequest,
  type SystemAdminClientListItem,
  type SystemAdminRequestLogListItem,
} from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { serializeApplicationDateTime } from '@/infrastructure/date-time';
import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { SystemModule } from '@/modules/access-control/modules/entities/system-module.entity';
import { ProfilePermission } from '@/modules/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { Action } from '@/modules/authorization/actions/entities/action.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { SessionAuthenticationService } from '@/modules/identity/authentication/session/session-authentication.service';
import { SessionSynchronizationService } from '@/modules/identity/authentication/session/session-synchronization.service';
import type { SaveClientRequestDto } from '@/modules/identity/clients/dto/req/save-client.request.dto';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { resolveFilePublicUrl } from '@/modules/media/files/helpers/file-public-url.helper';
import { RequestLog } from '@/modules/observability/request-logs/entities/request-log.entity';
import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { ReplaceUserAccessLinksRequestDto } from './dto/req/replace-user-access-links.request.dto';
import { SystemAdminClientListItemResponseDto } from './dto/res/system-admin-client-list-item.response.dto';
import { SystemAdminJobLogDetailResponseDto } from './dto/res/system-admin-job-log-detail.response.dto';
import { SystemAdminJobLogListItemResponseDto } from './dto/res/system-admin-job-log-list-item.response.dto';
import { SystemAdminRequestLogDetailResponseDto } from './dto/res/system-admin-request-log-detail.response.dto';
import { SystemAdminRequestLogListItemResponseDto } from './dto/res/system-admin-request-log-list-item.response.dto';
import { SystemAdminRepository } from './system-admin.repository';

@Injectable()
export class SystemAdminService {
  constructor(
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    private readonly dataSource: DataSource,
    private readonly repository: SystemAdminRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionAuthentication: SessionAuthenticationService,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async listClients(
    request: PaginateRequest,
  ): Promise<PaginatedBody<SystemAdminClientListItemResponseDto>> {
    const [clients, total] = await this.repository.listClients(request);
    const userCountByClientId = await this.repository.countUsersByClientIds(
      clients.map((client) => client.id),
    );

    return {
      items: toResponseDto(
        SystemAdminClientListItemResponseDto,
        clients.map((client) =>
          this.toClientListItem(client, userCountByClientId.get(client.id) ?? 0),
        ),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async updateClient(id: number, request: SaveClientRequestDto) {
    const client = await this.repository.findClientWithLanguages(id);

    if (!client || request.id !== id) {
      throw this.clientNotFound();
    }

    const languages = await this.languages.find({
      where: { id: In(request.languageLinks.map(({ languageId }) => languageId)) },
    });

    if (languages.length !== request.languageLinks.length) {
      throw this.clientLanguageNotFound();
    }

    Object.assign(client, {
      corporateName: request.corporateName,
      tradeName: request.tradeName,
      document: request.document,
      documentType: request.documentType,
      email: request.email,
      primaryPhone: request.primaryPhone,
      secondaryPhone: request.secondaryPhone,
      address: request.address,
      addressNumber: request.addressNumber,
      zipCode: request.zipCode,
      neighborhood: request.neighborhood,
      slug: request.slug,
      isActive: request.isActive,
      city: request.cityId === null ? null : { id: request.cityId },
      image: request.imageId === null ? null : { id: request.imageId },
      availableLanguageLinks: languages.map((language) => ({ language })),
    });

    const savedClient = await this.repository.saveClient(client);

    await this.sessionSynchronizationService.synchronizeAll();

    return savedClient;
  }

  async createClient(request: CreateSystemAdminClientRequest) {
    const catalogSlugs = new Set<string>(CORE_FUNCTIONALITY_CATALOG.map(({ slug }) => slug));

    if (request.functionalities.some(({ slug }) => !catalogSlugs.has(slug))) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.functionality_not_in_catalog'));
    }

    if (
      new Set(request.functionalities.map(({ slug }) => slug)).size !==
      request.functionalities.length
    ) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.functionality_duplicate'));
    }

    return this.dataSource.transaction(async (manager) => {
      const languageIds = [
        ...new Set(request.client.languageLinks.map(({ languageId }) => languageId)),
      ];

      const languages = await manager.find(Language, { where: { id: In(languageIds) } });

      if (languages.length !== languageIds.length) {
        throw this.clientLanguageNotFound();
      }

      const languageById = new Map(languages.map((language) => [language.id, language]));
      const languageByCode = new Map(
        languages.map((language) => [language.languageCode, language]),
      );

      const {
        cityId,
        id: _id,
        imageId,
        languageLinks: _languageLinks,
        ...clientData
      } = request.client;

      const client = await manager.save(Client, {
        ...clientData,
        city: cityId === null ? null : { id: cityId },
        image: imageId === null ? null : { id: imageId },
        availableLanguageLinks: request.client.languageLinks.map(({ languageId }) => ({
          language: languageById.get(languageId)!,
        })),
      });

      const moduleByKey = new Map<string, SystemModule>();

      for (const item of request.modules) {
        const module = await manager.save(SystemModule, {
          client,
          order: item.order,
          isActive: true,
          translations: item.translations.map((translation) => ({
            ...translation,
            language: languageByCode.get(translation.locale)!,
          })),
        });

        moduleByKey.set(item.key, module);
      }

      const functionalityBySlug = new Map<string, Functionality>();
      const pending = [...request.functionalities];

      while (pending.length > 0) {
        const index = pending.findIndex(
          (item) => item.parentSlug === null || functionalityBySlug.has(item.parentSlug),
        );
        if (index === -1) {
          throw new NotFoundException(
            this.i18n.t('errors.system_admin.invalid_functionality_hierarchy'),
          );
        }

        const item = pending.splice(index, 1)[0];
        const module = moduleByKey.get(item.moduleKey);

        if (!module || item.languageIds.some((id) => !languageById.has(id))) {
          throw new NotFoundException(
            this.i18n.t('errors.system_admin.invalid_functionality_configuration'),
          );
        }

        const functionality = await manager.save(Functionality, {
          client,
          module,
          parent: item.parentSlug === null ? null : functionalityBySlug.get(item.parentSlug)!,
          slug: item.slug,
          icon: item.icon,
          order: item.order,
          isNavigationGroup: item.isNavigationGroup,
          isActive: true,
          translations: item.translations.map((translation) => ({
            ...translation,
            language: languageByCode.get(translation.locale)!,
          })),
          enabledLanguageLinks: item.languageIds.map((id) => ({
            client,
            language: languageById.get(id)!,
          })),
        });

        functionalityBySlug.set(item.slug, functionality);
      }

      const profile = await manager.save(Profile, {
        client,
        isActive: true,
        isAdmin: true,
        translations: request.adminProfile.translations.map((translation) => ({
          ...translation,
          language: languageByCode.get(translation.locale)!,
        })),
      });

      const actions = await manager.find(Action);
      const permissions: DeepPartial<ProfilePermission>[] = [
        ...functionalityBySlug.values(),
      ].flatMap((functionality) => actions.map((action) => ({ profile, functionality, action })));

      await manager.save(ProfilePermission, permissions);

      return client;
    });
  }

  async setClientActive(id: number, isActive: boolean) {
    const client = await this.repository.findClient(id);

    if (!client) {
      throw this.clientNotFound();
    }

    client.isActive = isActive;

    const savedClient = await this.repository.saveClient(client);

    await this.sessionSynchronizationService.synchronizeAll();

    return savedClient;
  }

  async deleteClient(id: number) {
    const client = await this.repository.findClient(id);

    if (!client) {
      throw this.clientNotFound();
    }

    await this.repository.softDeleteClient(client);
    await this.sessionSynchronizationService.synchronizeAll();

    return { id };
  }

  async listRequestLogsPaginated(
    request: PaginateRequest,
  ): Promise<PaginatedBody<SystemAdminRequestLogListItemResponseDto>> {
    const [logs, total] = await this.repository.listRequestLogsPaginated(request);

    return {
      items: toResponseDto(
        SystemAdminRequestLogListItemResponseDto,
        logs.map((log) => this.toRequestLogListItem(log)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getRequestLog(id: number): Promise<SystemAdminRequestLogDetailResponseDto> {
    const log = await this.repository.findRequestLog(id);

    if (!log) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.request_log_not_found'));
    }

    return toResponseDto(SystemAdminRequestLogDetailResponseDto, {
      ...this.toRequestLogListItem(log),
      error: log.error,
      eventType: log.eventType,
      queryParams: log.queryParams,
      requestBody: log.requestBody,
      requestHeaders: log.requestHeaders,
      requestId: log.requestId,
      responseBody: log.responseBody,
      responseHeaders: log.responseHeaders,
      responseTimeDescription: log.responseTimeDescription,
      userAgent: log.userAgent,
    });
  }

  async listJobLogsPaginated(
    request: PaginateRequest,
  ): Promise<PaginatedBody<SystemAdminJobLogListItemResponseDto>> {
    const [logs, total] = await this.repository.listJobLogsPaginated(request);

    return {
      items: toResponseDto(
        SystemAdminJobLogListItemResponseDto,
        logs.map((log) => this.toJobLogListItem(log)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getJobLog(id: number): Promise<SystemAdminJobLogDetailResponseDto> {
    const log = await this.repository.findJobLog(id);

    if (!log) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.job_log_not_found'));
    }

    return toResponseDto(SystemAdminJobLogDetailResponseDto, {
      ...this.toJobLogListItem(log),
      error: log.error,
      finishedAt: log.finishedAt ? serializeApplicationDateTime(log.finishedAt) : null,
      startedAt: serializeApplicationDateTime(log.startedAt),
    });
  }

  listRequestLogClientOptions(request: PaginateRequest) {
    return this.repository.listRequestLogClientOptions(request);
  }

  listFiles(clientId?: number) {
    return this.repository.listFiles(clientId);
  }

  async listFilesPaginated(request: PaginateRequest) {
    const [items, total] = await this.repository.listFilesPaginated(request);
    return { items, meta: buildPaginationMeta(request, total) };
  }

  async replaceUserAccessLinks(userId: number, request: ReplaceUserAccessLinksRequestDto) {
    const ids = await this.dataSource.transaction(async (manager) => {
      const user = await this.repository.findAccessLinkUser(userId, manager);

      if (!user) {
        throw new NotFoundException(this.i18n.t('errors.system_admin.user_not_found'));
      }

      this.validateAccessLinks(request.links);

      const clientIds = [...new Set(request.links.map((link) => link.clientId))];
      const profileIds = [...new Set(request.links.map((link) => link.profileId))];

      const [clients, profiles, existingLinks] = await Promise.all([
        this.repository.findAccessLinkClients(clientIds, manager),
        this.repository.findAccessLinkProfiles(profileIds, manager),
        this.repository.findAccessLinksByUser(userId, manager),
      ]);

      const clientsById = new Map(clients.map((client) => [client.id, client]));
      const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
      const existingLinkKeys = new Set(
        existingLinks.map((link) => this.toAccessLinkKey(link.client.id, link.profile.id)),
      );

      for (const link of request.links) {
        const client = clientsById.get(link.clientId);

        if (!client) {
          throw new NotFoundException(this.i18n.t('errors.system_admin.client_not_found'));
        }

        const profile = profilesById.get(link.profileId);

        if (!profile) {
          throw new NotFoundException(this.i18n.t('errors.system_admin.profile_not_found'));
        }

        if (profile.client.id !== client.id) {
          throw new BadRequestException(this.i18n.t('errors.system_admin.profile_client_mismatch'));
        }

        const isExistingLink = existingLinkKeys.has(this.toAccessLinkKey(client.id, profile.id));

        if (!client.isActive && !isExistingLink) {
          throw new BadRequestException(
            this.i18n.t('errors.system_admin.access_link_inactive_client'),
          );
        }

        if (!profile.isActive && !isExistingLink) {
          throw new BadRequestException(
            this.i18n.t('errors.system_admin.access_link_inactive_profile'),
          );
        }
      }

      return this.repository.replaceAccessLinks(userId, request.links, manager);
    });

    await this.sessionAuthentication.destroyAllByUser(userId);

    return { ids: ids.map((link) => link.id) };
  }

  private validateAccessLinks(links: SystemAdminAccessLinkRequest[]): void {
    const clientIds = new Set<number>();
    const profileIds = new Set<number>();

    for (const link of links) {
      if (clientIds.has(link.clientId)) {
        throw new BadRequestException(
          this.i18n.t('errors.system_admin.access_link_duplicate_client'),
        );
      }

      if (profileIds.has(link.profileId)) {
        throw new BadRequestException(
          this.i18n.t('errors.system_admin.access_link_duplicate_profile'),
        );
      }

      clientIds.add(link.clientId);
      profileIds.add(link.profileId);
    }
  }

  private toAccessLinkKey(clientId: number, profileId: number): string {
    return `${clientId}:${profileId}`;
  }

  private toClientListItem(client: Client, userCount: number): SystemAdminClientListItem {
    return {
      corporateName: client.corporateName,
      document: client.document,
      documentType: client.documentType,
      id: client.id,
      imageUrl: resolveFilePublicUrl(client.image),
      isActive: client.isActive,
      tradeName: client.tradeName,
      userCount,
    };
  }

  private toRequestLogListItem(log: RequestLog): SystemAdminRequestLogListItem {
    return {
      accessType: log.accessType,
      clientId: log.client?.id ?? null,
      clientName: log.client?.tradeName ?? null,
      createdAt: serializeApplicationDateTime(log.createdAt),
      id: log.id,
      ip: log.ip,
      level: log.level,
      method: log.method,
      responseTimeMs: log.responseTimeMs,
      route: log.route,
      statusCode: log.statusCode,
      userName: log.user?.name ?? null,
    };
  }

  private toJobLogListItem(log: CronExecutionLog): CronExecutionLogListItem {
    return {
      createdAt: serializeApplicationDateTime(log.createdAt),
      durationMs: log.durationMs,
      id: log.id,
      message: log.message,
      status: log.status,
      taskName: log.taskName,
      totalError: log.totalError,
      totalProcessed: log.totalProcessed,
      totalSuccess: log.totalSuccess,
    };
  }

  private clientNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.client_not_found'));
  }

  private clientLanguageNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.language_not_found'));
  }
}
