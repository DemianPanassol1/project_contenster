import type { AppOption, SystemAdminAccessLinkRequest } from '@contenster/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DataSource } from 'typeorm';

import type { I18nTranslations } from '@/i18n/translations';
import { generatePasswordHash } from '@/infrastructure/security/password.util';
import { SessionAuthenticationService } from '@/modules/core/identity/authentication/session/session-authentication.service';
import { User } from '@/modules/core/identity/users/entities/user.entity';
import type { PaginateRequestDto } from '@/shared/dtos';
import { getCurrentLocale } from '@/shared/i18n';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation } from '@/shared/translations';

import { CreateAccessLinkUserRequestDto } from './dto/req/create-access-link-user.request.dto';
import { ReplaceUserAccessLinksRequestDto } from './dto/req/replace-user-access-links.request.dto';
import { SystemAdminAccessLinkUserDetailsResponseDto } from './dto/res/system-admin-access-link-user-details.response.dto';
import { AccessLinksRepository } from './access-links.repository';

@Injectable()
export class AccessLinksService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly repository: AccessLinksRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionAuthentication: SessionAuthenticationService,
  ) {}

  async listUserOptions(request: PaginateRequestDto): Promise<AppOption[]> {
    const [users] = await this.repository.listUserOptions(request);

    return users.map((user) => ({
      disabled: false,
      label: `${user.name} (${user.username})`,
      metadata: null,
      value: user.id,
    }));
  }

  async createUser(
    request: CreateAccessLinkUserRequestDto,
  ): Promise<{ id: number; name: string; username: string }> {
    const user = Object.assign(new User(), {
      email: request.email,
      image: request.imageId === null ? null : { id: request.imageId },
      isActive: request.isActive,
      isBlocked: request.isBlocked,
      isSuperuser: false,
      name: request.name,
      passwordHash: await generatePasswordHash(request.password),
      primaryPhone: request.primaryPhone,
      secondaryPhone: request.secondaryPhone,
      username: request.username,
    });

    const saved = await this.repository.saveUser(user);

    return {
      id: saved.id,
      name: saved.name,
      username: saved.username,
    };
  }

  async getUserDetails(id: number): Promise<SystemAdminAccessLinkUserDetailsResponseDto> {
    const [user, clients] = await Promise.all([
      this.repository.findUserDetails(id),
      this.repository.listClients(),
    ]);

    if (!user) {
      throw this.userNotFound();
    }

    const locale = getCurrentLocale();

    return toResponseDto(SystemAdminAccessLinkUserDetailsResponseDto, {
      clients: clients.map((client) => ({
        document: client.document,
        id: client.id,
        isActive: client.isActive,
        profiles: client.profiles.map((profile) => ({
          id: profile.id,
          isActive: profile.isActive,
          name: resolveTranslation(profile.translations, locale, 'name'),
        })),
        tradeName: client.tradeName,
      })),
      links: user.userProfiles.flatMap((link) =>
        link.client && link.profile
          ? [{ clientId: link.client.id, id: link.id, profileId: link.profile.id }]
          : [],
      ),
      user: {
        id: user.id,
        isSuperuser: user.isSuperuser,
        name: user.name,
        username: user.username,
      },
    });
  }

  async replace(
    userId: number,
    request: ReplaceUserAccessLinksRequestDto,
  ): Promise<{ ids: number[] }> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const user = await this.repository.findUser(userId, manager);

      if (!user) {
        throw this.userNotFound();
      }

      this.validate(request.links);

      const clientIds = [...new Set(request.links.map((link) => link.clientId))];
      const profileIds = [...new Set(request.links.map((link) => link.profileId))];

      const [clients, profiles, existing] = await Promise.all([
        this.repository.findClients(clientIds, manager),
        this.repository.findProfiles(profileIds, manager),
        this.repository.findByUser(userId, manager),
      ]);
      const clientsById = new Map(clients.map((client) => [client.id, client]));
      const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
      const byKey = new Map(
        existing.map((link) => [this.key(link.client.id, link.profile.id), link]),
      );
      const ids = new Set(existing.map((link) => link.id));
      const links = request.links.map((link) =>
        link.id !== null
          ? link
          : { ...link, id: byKey.get(this.key(link.clientId, link.profileId))?.id ?? null },
      );

      if (links.some((link) => link.id !== null && !ids.has(link.id))) {
        throw new BadRequestException(this.i18n.t('errors.system_admin.access_link_not_found'));
      }

      for (const link of links) {
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

        const exists = byKey.has(this.key(client.id, profile.id));

        if (!client.isActive && !exists) {
          throw new BadRequestException(
            this.i18n.t('errors.system_admin.access_link_inactive_client'),
          );
        }

        if (!profile.isActive && !exists) {
          throw new BadRequestException(
            this.i18n.t('errors.system_admin.access_link_inactive_profile'),
          );
        }
      }

      return this.repository.replace(user, links, manager);
    });

    await this.sessionAuthentication.destroyAllByUser(userId);

    return { ids: saved.map((link) => link.id) };
  }

  private validate(links: SystemAdminAccessLinkRequest[]): void {
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

  private key(clientId: number, profileId: number): string {
    return `${clientId}:${profileId}`;
  }

  private userNotFound(): NotFoundException {
    return new NotFoundException(this.i18n.t('errors.system_admin.user_not_found'));
  }
}
