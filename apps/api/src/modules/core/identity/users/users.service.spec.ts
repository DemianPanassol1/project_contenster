import type { SaveUserRequest } from '@contenster/shared';
import { BadRequestException } from '@nestjs/common';
import type { DataSource, EntityManager } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';

import type { User } from './entities/user.entity';
import { UsersService } from './users.service';

const request: SaveUserRequest = {
  email: 'user@example.com',
  id: 10,
  imageId: null,
  isActive: true,
  isBlocked: false,
  name: 'Example user',
  password: null,
  primaryPhone: '5551999999999',
  profileId: 3,
  secondaryPhone: null,
  userProfileId: 20,
  username: 'example.user',
};

function createExistingUser(): User {
  return {
    email: request.email,
    id: request.id ?? 10,
    image: null,
    isActive: true,
    isBlocked: false,
    lastLoginAt: null,
    name: request.name,
    primaryPhone: request.primaryPhone,
    secondaryPhone: null,
    userProfiles: [
      {
        client: { id: 1 },
        id: request.userProfileId ?? 20,
        profile: { id: request.profileId },
      },
    ],
    username: request.username,
  } as User;
}

describe('UsersService', () => {
  it('persists through the caller transaction and synchronizes sessions only after commit', async () => {
    const events: string[] = [];
    const manager = {} as EntityManager;
    const user = createExistingUser();
    const repository = {
      findById: vi.fn().mockResolvedValue(user),
      saveWithProfile: vi.fn().mockResolvedValue(user),
    };
    const dataSource = {
      transaction: vi.fn(async (callback: (transactionManager: EntityManager) => Promise<User>) => {
        const result = await callback(manager);
        events.push('commit');
        return result;
      }),
    };
    const profilesService = {
      findAssignableProfile: vi.fn().mockResolvedValue({ id: request.profileId }),
    };
    const sessionSynchronizationService = {
      synchronizeAll: vi.fn().mockImplementation(() => {
        events.push('synchronize');
      }),
    };
    const service = new UsersService(
      dataSource as unknown as DataSource,
      repository as never,
      profilesService as never,
      { t: vi.fn((key: string) => key) } as never,
      sessionSynchronizationService as never,
      {} as never,
    );

    await service.save(1, request);

    expect(repository.saveWithProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: request.id }),
      request.userProfileId,
      1,
      expect.objectContaining({ id: request.profileId }),
      manager,
    );
    expect(events).toEqual(['commit', 'synchronize']);
  });

  it('does not synchronize sessions when transactional validation fails', async () => {
    const repository = { saveWithProfile: vi.fn() };
    const dataSource = {
      transaction: vi.fn(async (callback: (transactionManager: EntityManager) => Promise<User>) =>
        callback({} as EntityManager),
      ),
    };
    const profilesService = { findAssignableProfile: vi.fn().mockResolvedValue(null) };
    const sessionSynchronizationService = { synchronizeAll: vi.fn() };
    const service = new UsersService(
      dataSource as unknown as DataSource,
      repository as never,
      profilesService as never,
      { t: vi.fn((key: string) => key) } as never,
      sessionSynchronizationService as never,
      {} as never,
    );

    await expect(
      service.save(1, { ...request, id: null, password: 'secret' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.saveWithProfile).not.toHaveBeenCalled();
    expect(sessionSynchronizationService.synchronizeAll).not.toHaveBeenCalled();
  });
});
