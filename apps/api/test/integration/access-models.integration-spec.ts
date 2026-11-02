import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Functionality } from '@/modules/core/access-control/functionalities/entities/functionality.entity';
import { ProfilePermission } from '@/modules/core/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { ClientLanguage } from '@/modules/core/identity/clients/entities/client-language.entity';
import { AccessModelsService } from '@/modules/core/system-admin/access-models/access-models.service';

import { createTestApplication } from '../runner/app.factory';

describe('access model persistence', () => {
  let app: INestApplication;
  let service: AccessModelsService;

  beforeAll(async () => {
    app = await createTestApplication();
    service = app.get(AccessModelsService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('preserves translation identity and module keys when editing a persisted model', async () => {
    const model = await service.save({
      id: null,
      isActive: true,
      translations: [{ id: null, locale: 'pt', name: 'Integration', description: null }],
      structure: {
        modules: [
          {
            key: null,
            order: 0,
            isActive: true,
            translations: [{ locale: 'pt', name: 'Module', description: null }],
            functionalities: [],
          },
        ],
      },
    });

    const updated = await service.save({
      id: model.id,
      isActive: true,
      translations: model.translations.map((item) => ({ ...item, name: 'Updated' })),
      structure: model.structure,
    });

    expect(updated.translations[0]?.id).toBe(model.translations[0]?.id);
    expect(updated.structure.modules[0]?.key).toBe(model.structure.modules[0]?.key);

    const preview = await service.preview(model.id, 1);
    await expect(service.apply(model.id, 1, '0'.repeat(64), [])).rejects.toThrow();

    const result = await service.apply(model.id, 1, preview.fingerprint, []);
    expect(result.createdModules).toBe(0);

    const applied = await service.apply(
      model.id,
      1,
      preview.fingerprint,
      preview.changes
        .filter((change) => change.kind === 'create_module')
        .map((change) => change.id),
    );
    expect(applied.createdModules).toBe(1);

    await expect(service.apply(model.id, 1, preview.fingerprint, [])).rejects.toThrow();
    await service.delete({ id: model.id, ids: [] });
  });

  it('rejects translation IDs owned by another model and changed module identities', async () => {
    const input = {
      id: null,
      isActive: true,
      translations: [{ id: null, locale: 'pt', name: 'Ownership', description: null }],
      structure: {
        modules: [
          {
            key: null,
            order: 0,
            isActive: true,
            translations: [{ locale: 'pt', name: 'Module', description: null }],
            functionalities: [],
          },
        ],
      },
    };
    const first = await service.save(input);
    const second = await service.save(input);
    try {
      await expect(
        service.save({
          id: second.id,
          isActive: true,
          translations: first.translations,
          structure: second.structure,
        }),
      ).rejects.toThrow();
      const structure = structuredClone(second.structure);
      structure.modules[0].key = 'MOD_00000000';
      await expect(
        service.save({
          id: second.id,
          isActive: true,
          translations: second.translations,
          structure,
        }),
      ).rejects.toThrow();
    } finally {
      await service.delete({ id: null, ids: [first.id, second.id] });
    }
  });

  it('moves functionalities before deleting their original module and preserves permissions', async () => {
    const db = app.get(DataSource);
    const source = await db.getRepository(Client).findOneByOrFail({ id: 1 });
    const { id: _id, createdAt: _created, updatedAt: _updated, ...clientData } = source;
    const client = await db
      .getRepository(Client)
      .save({ ...clientData, slug: 'model-move-regression' });
    const language = await db
      .getRepository(ClientLanguage)
      .findOneOrFail({ where: { client: { id: 1 } }, relations: { language: true } });
    await db.getRepository(ClientLanguage).save({ client, language: language.language });
    const profile = await db
      .getRepository(Profile)
      .save({ client, isActive: true, isAdmin: true, translations: [] });
    const locale = language.language.languageCode;
    const definition = {
      slug: 'users',
      parentSlug: null,
      icon: null,
      order: 0,
      isActive: true,
      isNavigationGroup: false,
      enabledLanguageCodes: [locale],
      translations: [{ locale, name: 'Users', description: null }],
    };
    const model = await service.save({
      id: null,
      isActive: true,
      translations: [{ id: null, locale, name: 'Move', description: null }],
      structure: {
        modules: [
          {
            key: null,
            order: 0,
            isActive: true,
            translations: [{ locale, name: 'First', description: null }],
            functionalities: [definition],
          },
        ],
      },
    });
    let preview = await service.preview(model.id, client.id);
    await service.apply(
      model.id,
      client.id,
      preview.fingerprint,
      preview.changes.map((item) => item.id),
    );
    const original = await db
      .getRepository(Functionality)
      .findOneByOrFail({ client: { id: client.id }, slug: 'users' });
    const permissions = await db
      .getRepository(ProfilePermission)
      .countBy({ profile: { id: profile.id } });
    const updated = await service.save({
      id: model.id,
      isActive: true,
      translations: model.translations,
      structure: {
        modules: [
          {
            key: null,
            order: 0,
            isActive: true,
            translations: [{ locale, name: 'Second', description: null }],
            functionalities: [definition],
          },
        ],
      },
    });
    preview = await service.preview(updated.id, client.id);
    await service.apply(
      updated.id,
      client.id,
      preview.fingerprint,
      preview.changes.map((item) => item.id),
    );
    const moved = await db
      .getRepository(Functionality)
      .findOneByOrFail({ client: { id: client.id }, slug: 'users' });
    expect(moved.id).toBe(original.id);
    expect(await db.getRepository(ProfilePermission).countBy({ profile: { id: profile.id } })).toBe(
      permissions,
    );
    expect((await service.preview(updated.id, client.id)).changes).toEqual([]);
    const withChild = await service.save({
      id: model.id,
      isActive: true,
      translations: model.translations,
      structure: {
        modules: [
          {
            ...updated.structure.modules[0],
            functionalities: [definition, { ...definition, slug: 'profiles', parentSlug: 'users' }],
          },
        ],
      },
    });
    preview = await service.preview(model.id, client.id);
    await service.apply(
      model.id,
      client.id,
      preview.fingerprint,
      preview.changes.map((item) => item.id),
    );
    await service.save({
      id: model.id,
      isActive: true,
      translations: model.translations,
      structure: {
        modules: [
          {
            ...withChild.structure.modules[0],
            functionalities: [
              { ...definition, parentSlug: 'profiles' },
              { ...definition, slug: 'profiles', parentSlug: null },
            ],
          },
        ],
      },
    });
    preview = await service.preview(model.id, client.id);
    await expect(
      service.apply(model.id, client.id, preview.fingerprint, ['functionality:users']),
    ).rejects.toThrow();
    await service.apply(
      model.id,
      client.id,
      preview.fingerprint,
      preview.changes.map((item) => item.id),
    );
    const permission = await db
      .getRepository(ProfilePermission)
      .findOneOrFail({ where: { profile: { id: profile.id } } });
    await db.getRepository(ProfilePermission).remove(permission);
    preview = await service.preview(model.id, client.id);
    expect(preview.changes.length).toBeGreaterThan(0);
    await service.apply(
      model.id,
      client.id,
      preview.fingerprint,
      preview.changes.map((item) => item.id),
    );
    expect((await service.preview(model.id, client.id)).changes).toEqual([]);
    const latest = await service.getById(model.id);
    latest.structure.modules[0].order++;
    await service.save({
      id: model.id,
      isActive: true,
      translations: latest.translations,
      structure: latest.structure,
    });
    preview = await service.preview(model.id, client.id);
    const concurrent = await Promise.allSettled([
      service.apply(
        model.id,
        client.id,
        preview.fingerprint,
        preview.changes.map((item) => item.id),
      ),
      service.apply(
        model.id,
        client.id,
        preview.fingerprint,
        preview.changes.map((item) => item.id),
      ),
    ]);
    expect(concurrent.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
    expect(concurrent.filter((item) => item.status === 'rejected')).toHaveLength(1);
    await service.delete({ id: model.id, ids: [] });
  });
});
