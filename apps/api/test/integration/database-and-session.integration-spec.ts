import type { AuthenticatedSession } from '@contenster/shared';
import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

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

  it('persists opaque sessions in Redis and invalidates them by token', async () => {
    const session: AuthenticatedSession = {
      context: {
        client: {
          id: 1,
          languages: [{ id: 1, languageCode: 'pt', name: 'Português' }],
          name: 'Cliente',
        },
        profile: { description: null, id: 1, name: 'Administrador' },
      },
      modules: [],
      user: {
        email: 'admin@cliente-inicial.local',
        id: 1,
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
