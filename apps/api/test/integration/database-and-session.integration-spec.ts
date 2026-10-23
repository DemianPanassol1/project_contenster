import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
  type AuthenticatedSession,
  RequestLogAccessType,
  SessionContextType,
} from '@contenster/shared';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { SessionAuthenticationService } from '@/modules/identity/authentication/session/session-authentication.service';

import { createTestApplication } from '../runner/app.factory';

describe('database and session integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sessions: SessionAuthenticationService;

  beforeAll(async () => {
    app = await createTestApplication();
    dataSource = app.get(DataSource);
    sessions = app.get(SessionAuthenticationService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('applies the bootstrap migrations with the expected core baseline', async () => {
    const [{ clients }] = await dataSource.query<{ clients: string }[]>(
      'SELECT COUNT(*)::text AS clients FROM clientes',
    );
    const [{ languages }] = await dataSource.query<{ languages: string }[]>(
      'SELECT COUNT(*)::text AS languages FROM idiomas',
    );
    const [{ functionalities }] = await dataSource.query<{ functionalities: string }[]>(
      'SELECT COUNT(*)::text AS functionalities FROM funcionalidades',
    );

    expect(Number(clients)).toBeGreaterThanOrEqual(1);
    expect(Number(languages)).toBeGreaterThanOrEqual(3);
    expect(Number(functionalities)).toBeGreaterThanOrEqual(12);
  });

  it('keeps the explicitly named foreign keys created by migrations', async () => {
    const constraints = await dataSource.query<{ conname: string }[]>(
      `SELECT conname
       FROM pg_constraint
       WHERE conname IN (
         'fk_modulos_cliente',
         'fk_funcionalidades_cliente',
         'fk_usuarios_perfis_perfil_cliente'
       )`,
    );

    expect(constraints.map(({ conname }) => conname).sort()).toEqual([
      'fk_funcionalidades_cliente',
      'fk_modulos_cliente',
      'fk_usuarios_perfis_perfil_cliente',
    ]);
  });

  it('creates the administrative profile and request-log access type introduced by system administration', async () => {
    const [profile] = await dataSource.query<{ isAdmin: boolean }[]>(
      'SELECT eh_admin AS "isAdmin" FROM perfis WHERE id = 1 AND cliente_id = 1',
    );
    const [index] = await dataSource.query<{ indexdef: string }[]>(
      `SELECT indexdef
       FROM pg_indexes
       WHERE indexname = 'uq_perfis_cliente_eh_admin'`,
    );
    const enumValues = await dataSource.query<{ enumlabel: string }[]>(
      `SELECT enumlabel
       FROM pg_enum
       WHERE enumtypid = 'tipo_acesso_log_requisicao'::regtype
       ORDER BY enumsortorder`,
    );

    expect(profile.isAdmin).toBe(true);
    expect(index.indexdef).toContain('WHERE (eh_admin = true)');
    expect(enumValues.map(({ enumlabel }) => enumlabel)).toEqual([
      RequestLogAccessType.client,
      RequestLogAccessType.superuser,
    ]);
  });

  it('allows only one administrative profile for each client', async () => {
    await expect(
      dataSource.getRepository(Profile).save({
        client: { id: 1 },
        isActive: true,
        isAdmin: true,
        permissions: [],
        translations: [],
      }),
    ).rejects.toThrow();
  });

  it('persists opaque sessions in Redis and invalidates them by token', async () => {
    const session: AuthenticatedSession = {
      context: {
        accessType: RequestLogAccessType.client,
        client: {
          id: 1,
          languages: [{ id: 1, languageCode: 'pt', name: 'Português' }],
          name: 'Cliente',
        },
        profile: { description: null, id: 1, name: 'Administrador' },
        type: SessionContextType.client,
      },
      modules: [],
      user: {
        email: 'admin@cliente-inicial.local',
        id: 1,
        isSuperuser: false,
        name: 'Administrador',
        username: 'admin',
      },
    };
    const created = await sessions.create(session, false);

    await expect(sessions.getByToken(created.token)).resolves.toMatchObject({ session });
    await sessions.destroy(created.token);
    await expect(sessions.getByToken(created.token)).resolves.toBeNull();
  });
});
