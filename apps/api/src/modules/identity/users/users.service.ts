import type { PaginatedBody } from '@contenster/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { generatePasswordHash } from '@/infrastructure/security/password.util';
import { SessionSynchronizationService } from '@/modules/identity/authentication/session/session-synchronization.service';
import {
  type DeleteRecordsRequestDto,
  DeleteRecordsResponseDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import type { SaveUserRequestDto } from './dto/req/save-user-request.js';
import { GetUserByIdResponseDto } from './dto/res/get-user-by-id-response.js';
import { UserListItemResponseDto } from './dto/res/user-list-item-response.js';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  async list(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<UserListItemResponseDto>> {
    const [users, total] = await this.repository.list(clientId, request);
    return {
      items: toResponseDto(
        UserListItemResponseDto,
        users.map((user) => this.toListItem(user)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(clientId: number, id: number): Promise<GetUserByIdResponseDto> {
    const user = await this.getEntityByIdOrFail(clientId, id);
    const userProfile = user.userProfiles.find((item) => item.client.id === clientId);

    if (!userProfile) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return toResponseDto(GetUserByIdResponseDto, {
      ...this.toListItem(user),
      primaryPhone: user.primaryPhone,
      secondaryPhone: user.secondaryPhone,
      imageId: user.image?.id ?? null,
      clientId,
      userProfileId: userProfile.id,
      profileId: userProfile.profile.id,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    });
  }

  async save(clientId: number, request: SaveUserRequestDto): Promise<GetUserByIdResponseDto> {
    if (request.clientId !== clientId) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }

    const existing =
      request.id === null ? null : await this.getEntityByIdOrFail(clientId, request.id);

    if (!existing && request.password === null) {
      throw new BadRequestException(this.i18n.t('validation.required'));
    }

    if (existing && request.userProfileId !== null) {
      const currentUserProfile = existing.userProfiles.find(
        (userProfile) => userProfile.client.id === clientId,
      );

      if (currentUserProfile?.id !== request.userProfileId) {
        throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
      }
    }

    const profile = await this.repository.findProfile(clientId, request.profileId);

    if (!profile) {
      throw new BadRequestException(this.i18n.t('errors.common.record_not_found'));
    }

    const user = Object.assign(existing ?? new User(), {
      name: request.name,
      email: request.email,
      username: request.username,
      primaryPhone: request.primaryPhone,
      secondaryPhone: request.secondaryPhone,
      image: request.imageId === null ? null : { id: request.imageId },
      isActive: request.isActive,
      isBlocked: request.isBlocked,
    });

    if (request.password !== null) {
      user.passwordHash = await generatePasswordHash(request.password);
    }

    const saved = await this.repository.save(user, request.userProfileId, clientId, profile);

    await this.sessionSynchronizationService.synchronizeAll();

    return this.getById(clientId, saved.id);
  }

  async delete(
    clientId: number,
    request: DeleteRecordsRequestDto,
  ): Promise<DeleteRecordsResponseDto> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const users = await this.repository.findByIds(clientId, ids);

    if (users.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    const result = await this.repository.delete(users);

    await this.sessionSynchronizationService.synchronizeAll();

    return toResponseDto(DeleteRecordsResponseDto, { ids: result });
  }

  private async getEntityByIdOrFail(clientId: number, id: number): Promise<User> {
    const user = await this.repository.findById(clientId, id);

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return user;
  }

  private toListItem(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    };
  }
}
