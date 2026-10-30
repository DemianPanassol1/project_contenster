import { describe, expect, it, vi } from 'vitest';

import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';

import { SystemAdminRepository } from './system-admin.repository';

describe('SystemAdminRepository', () => {
  it('persists access links through the user aggregate without deleting all links', async () => {
    const user = { id: 8, userProfiles: [] } as unknown as User;
    const create = vi.fn((_: typeof UserProfile, value: Partial<UserProfile>) => value);
    const save = vi.fn().mockResolvedValue({
      ...user,
      userProfiles: [{ id: 13 }],
    });
    const repository = new SystemAdminRepository(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await repository.replaceAccessLinks(
      user,
      [{ clientId: 3, id: 13, profileId: 5 }],
      { create, save } as never,
    );

    expect(create).toHaveBeenCalledWith(UserProfile, {
      client: { id: 3 },
      id: 13,
      profile: { id: 5 },
    });
    expect(save).toHaveBeenCalledWith(User, user);
    expect(result).toEqual([{ id: 13 }]);
  });
});
