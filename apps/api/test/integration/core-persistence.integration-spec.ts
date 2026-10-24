import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { ProfilePermission } from '@/modules/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { Action } from '@/modules/authorization/actions/entities/action.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';

import { createTestApplication } from '../runner/app.factory';
import { createSecondaryClientFixture } from '../runner/fixtures';

describe('core persistence integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApplication();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('removes profile permission orphans when the profile is saved without them', async () => {
    const profileRepository = dataSource.getRepository(Profile);
    const functionality = await dataSource.getRepository(Functionality).findOneOrFail({
      where: { client: { id: 1 } },
    });
    const action = await dataSource.getRepository(Action).findOneByOrFail({});
    const profile = await profileRepository.save({
      client: { id: 1 },
      isActive: true,
      permissions: [{ action, functionality }],
      translations: [],
    });

    expect(
      await dataSource
        .getRepository(ProfilePermission)
        .count({ where: { profile: { id: profile.id } } }),
    ).toBe(1);

    await profileRepository.save({ ...profile, permissions: [] });

    await expect(
      dataSource.getRepository(ProfilePermission).count({ where: { profile: { id: profile.id } } }),
    ).resolves.toBe(0);
  });

  it('rejects a user profile whose profile belongs to another client', async () => {
    const secondary = await createSecondaryClientFixture(dataSource);
    const user = await dataSource.getRepository(User).save({
      email: 'cross-client-user@test.local',
      isActive: true,
      isBlocked: false,
      name: 'Cross client user',
      passwordHash: 'not-used-in-this-test',
      primaryPhone: '11999999999',
      secondaryPhone: null,
      username: 'cross-client-user',
    });

    await expect(
      dataSource.getRepository(UserProfile).save({
        client: { id: secondary.clientId },
        profile: { id: 1 },
        user,
      }),
    ).rejects.toThrow();
  });

  it('creates the portal schema and permits global media records without a client', async () => {
    const [{ is_nullable: isNullable }] = await dataSource.query<{ is_nullable: string }[]>(
      `SELECT is_nullable
       FROM information_schema.columns
       WHERE table_name = 'arquivos' AND column_name = 'cliente_id'`,
    );
    const [{ portalDomains, portals, portalTranslations }] = await dataSource.query<
      { portalDomains: string | null; portals: string | null; portalTranslations: string | null }[]
    >(
      `SELECT
        to_regclass('public.portais') AS portals,
        to_regclass('public.portais_dominios') AS "portalDomains",
        to_regclass('public.portais_traducoes') AS "portalTranslations"`,
    );

    expect(isNullable).toBe('YES');
    expect(portals).toBe('portais');
    expect(portalDomains).toBe('portais_dominios');
    expect(portalTranslations).toBe('portais_traducoes');
  });
});
