import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import request, { type Agent } from 'supertest';
import { DataSource } from 'typeorm';

import {
  CronExecutionStatus,
  FileType,
  RequestLogAccessType,
  SessionContextType,
  StorageProvider,
} from '@contenster/shared';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';
import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';

import { createTestApplication } from '../runner/app.factory';
import { createSecondaryClientFixture } from '../runner/fixtures';

interface ApiResponse<T> {
  body: T;
  errors: { count: number; items: unknown[] };
  statusCode: number;
}

const waitFor = async (predicate: () => Promise<boolean>, timeoutMs = 2_000): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await predicate()) return;

    await new Promise<void>((resolve) => setTimeout(resolve, 25));
  }

  throw new Error('Timed out while waiting for the expected asynchronous operation.');
};

describe('authentication and authorization', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let httpServer: Server;
  let agent: Agent;
  let secondaryClientId: number;

  beforeAll(async () => {
    app = await createTestApplication();
    httpServer = app.getHttpServer() as Server;
    agent = request.agent(httpServer);
    dataSource = app.get(DataSource);
    const fixture = await createSecondaryClientFixture(dataSource);
    secondaryClientId = fixture.clientId;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    await app.close();
  });

  it('rejects invalid credentials', async () => {
    const response = await request(httpServer)
      .post('/auth/authorize')
      .send({ password: 'invalid-password', username: 'admin' })
      .expect(401);

    expect((response.body as ApiResponse<unknown>).errors.count).toBeGreaterThan(0);
  });

  it('authorizes, signs in and persists only an opaque cookie in the browser', async () => {
    const authorization = await request(httpServer)
      .post('/auth/authorize')
      .send({ password: '123456', username: 'admin' })
      .expect(201);
    const authorized = authorization.body as ApiResponse<{
      clients: Array<{ value: number }>;
    }>;

    expect(authorized.body.clients.map(({ value }) => value)).toEqual(
      expect.arrayContaining([1, secondaryClientId]),
    );
    expect(authorized.body).toMatchObject({ isEligibleToGlobalContext: false });

    const signIn = await agent
      .post('/auth/sign-in')
      .send({ clientId: 1, password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);
    const rawCookies: unknown = signIn.headers['set-cookie'];
    const cookieHeader = Array.isArray(rawCookies) ? rawCookies.join(';') : '';

    expect(cookieHeader).toContain('contenster_session=');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).not.toContain('"user"');

    const session = await agent.get('/auth/session').expect(200);
    const current = session.body as ApiResponse<{
      context: { client: { document: string; documentType: string; id: number } };
      user: { id: number };
    }>;

    expect(current.body.user.id).toBe(1);
    expect(current.body.context.client.id).toBe(1);
    expect(current.body.context.client.document).toEqual(expect.any(String));
    expect(current.body.context.client.documentType).toEqual(expect.any(String));

    const availableClients = await agent.get('/auth/available-clients').expect(200);
    const available = availableClients.body as ApiResponse<{
      clients: Array<{ disabled: boolean; value: number }>;
    }>;

    expect(available.body.clients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ disabled: false, value: 1 }),
        expect.objectContaining({ disabled: false, value: secondaryClientId }),
      ]),
    );

    await waitFor(async () => {
      const [{ logCount }] = await dataSource.query<{ logCount: string }[]>(
        `SELECT COUNT(*)::text AS "logCount"
         FROM logs_requisicoes
         WHERE cliente_id = 1 AND rota = '/auth/session'`,
      );

      return logCount === '1';
    });

    const listedLogs = await agent.post('/client-logs/requests/list').send({}).expect(201);
    const logs = (listedLogs.body as ApiResponse<{ items: Array<{ route: string }> }>).body.items;

    expect(logs).toEqual(
      expect.arrayContaining([expect.objectContaining({ route: '/auth/session' })]),
    );
  });

  it('executes the country CRUD through the authenticated permission boundary', async () => {
    const created = await agent
      .post('/countries')
      .send({
        currencyCode: 'TST',
        id: null,
        isActive: true,
        iso2: 'ZZ',
        iso3: 'ZZZ',
        locale: 'pt',
        phoneCode: '+99',
        translations: [{ id: null, locale: 'pt', name: 'País de teste' }],
      })
      .expect(201);
    const country = (
      created.body as ApiResponse<{ id: number; translations: Array<{ id: number }> }>
    ).body;

    expect(country.id).toEqual(expect.any(Number));

    const updated = await agent
      .post('/countries')
      .send({
        currencyCode: 'TST',
        id: country.id,
        isActive: false,
        iso2: 'ZZ',
        iso3: 'ZZZ',
        locale: 'pt',
        phoneCode: '+99',
        translations: [
          { id: country.translations[0].id, locale: 'pt', name: 'País de teste editado' },
        ],
      })
      .expect(201);

    expect((updated.body as ApiResponse<{ isActive: boolean; name: string }>).body).toMatchObject({
      isActive: false,
      name: 'País de teste editado',
    });

    await agent.post('/countries/delete').send({ id: country.id, ids: [] }).expect(201);
    await agent.get(`/countries/${country.id}`).expect(404);
  });

  it('saves, lists and deletes a client-owned local storage configuration and rule', async () => {
    const configuration = await agent
      .post('/client-storage/configurations')
      .send({
        accountId: null,
        accessKeyId: null,
        bucketName: null,
        clientEmail: null,
        endpoint: null,
        id: null,
        identifier: 'e2e-storage',
        isActive: true,
        name: 'E2E Local Storage',
        privateKey: null,
        projectId: null,
        provider: StorageProvider.local,
        publicBaseUrl: null,
        secretAccessKey: null,
        signedUrlExpiresInSeconds: null,
        useSignedUrls: false,
      })
      .expect(201);
    const configurationBody = (
      configuration.body as ApiResponse<{ id: number; provider: StorageProvider }>
    ).body;

    expect(configurationBody.provider).toBe(StorageProvider.local);

    const rule = await agent
      .post('/client-storage/rules')
      .send({
        fileType: FileType.image,
        id: null,
        isActive: true,
        storageConfigurationId: configurationBody.id,
      })
      .expect(201);
    const ruleId = (rule.body as ApiResponse<{ id: number }>).body.id;

    const configurations = await agent
      .post('/client-storage/configurations/list')
      .send({})
      .expect(201);

    expect(
      (configurations.body as ApiResponse<{ items: Array<{ id: number }> }>).body.items,
    ).toEqual(expect.arrayContaining([expect.objectContaining({ id: configurationBody.id })]));

    await agent.post('/client-storage/rules/delete').send({ id: ruleId, ids: [] }).expect(201);
    await agent
      .post('/client-storage/configurations/delete')
      .send({ id: configurationBody.id, ids: [] })
      .expect(201);
  });

  it('uploads files for the authenticated client and prevents access from another client', async () => {
    const configuration = await agent
      .post('/client-storage/configurations')
      .send({
        accountId: null,
        accessKeyId: null,
        bucketName: null,
        clientEmail: null,
        endpoint: null,
        id: null,
        identifier: 'e2e-upload',
        isActive: true,
        name: 'E2E Upload Storage',
        privateKey: null,
        projectId: null,
        provider: StorageProvider.local,
        publicBaseUrl: null,
        secretAccessKey: null,
        signedUrlExpiresInSeconds: null,
        useSignedUrls: false,
      })
      .expect(201);
    const configurationId = (configuration.body as ApiResponse<{ id: number }>).body.id;

    await agent
      .post('/client-storage/rules')
      .send({
        fileType: FileType.image,
        id: null,
        isActive: true,
        storageConfigurationId: configurationId,
      })
      .expect(201);

    const image = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLq7wAAAABJRU5ErkJggg==',
      'base64',
    );
    const upload = await agent
      .post('/media/files/upload')
      .attach('file', image, { contentType: 'image/png', filename: 'pixel.png' })
      .expect(201);
    const uploaded = (
      upload.body as ApiResponse<{
        clientId: number;
        id: number;
        mimeType: string;
        originalName: string;
        type: FileType;
        uploadedByUserId: number | null;
        url: string | null;
      }>
    ).body;

    expect(uploaded).toMatchObject({
      clientId: 1,
      mimeType: 'image/png',
      originalName: 'pixel.png',
      type: FileType.image,
      uploadedByUserId: 1,
    });
    expect(uploaded.url).toEqual(expect.stringMatching(/^\/uploads\/e2e-upload\/images\//));

    const found = await agent.get(`/media/files/${uploaded.id}`).expect(200);
    expect((found.body as ApiResponse<{ id: number }>).body.id).toBe(uploaded.id);

    const secondaryAgent = request.agent(httpServer);
    await secondaryAgent
      .post('/auth/sign-in')
      .send({
        clientId: secondaryClientId,
        password: '123456',
        staySignedIn: false,
        username: 'admin',
      })
      .expect(201);

    await secondaryAgent.get(`/media/files/${uploaded.id}`).expect(404);
  });

  it('executes the administrative CRUDs for languages, modules, functionalities, profiles and users', async () => {
    const language = await agent
      .post('/languages')
      .send({ iconId: null, id: null, languageCode: 'tz', name: 'Teste E2E', regionCode: 'TZ' })
      .expect(201);
    const languageId = (language.body as ApiResponse<{ id: number }>).body.id;

    await agent
      .post('/languages')
      .send({
        iconId: null,
        id: languageId,
        languageCode: 'tz',
        name: 'Teste E2E atualizado',
        regionCode: 'TZ',
      })
      .expect(201);

    const actions = await agent.post('/actions/list').send({}).expect(201);
    const actionId = (actions.body as ApiResponse<{ items: Array<{ id: number; type: string }> }>)
      .body.items[0].id;
    const action = await agent.get(`/actions/${actionId}`).expect(200);
    const actionBody = (action.body as ApiResponse<Record<string, unknown>>).body;

    await agent.post('/actions').send(actionBody).expect(201);

    const module = await agent
      .post('/modules')
      .send({
        id: null,
        isActive: true,
        order: 99,
        translations: [
          { description: 'Módulo criado por e2e.', id: null, locale: 'pt', name: 'Módulo E2E' },
        ],
      })
      .expect(201);
    const moduleId = (module.body as ApiResponse<{ id: number }>).body.id;

    const functionality = await agent
      .post('/functionalities')
      .send({
        icon: null,
        id: null,
        isActive: true,
        isNavigationGroup: false,
        languageLinks: [{ id: null, languageId: 1 }],
        moduleId,
        order: 99,
        parentId: null,
        slug: 'e2e-test-functionality',
        translations: [
          {
            description: 'Funcionalidade criada por e2e.',
            id: null,
            locale: 'pt',
            name: 'Funcionalidade E2E',
          },
        ],
      })
      .expect(201);
    const functionalityId = (functionality.body as ApiResponse<{ id: number }>).body.id;

    const profile = await agent
      .post('/profiles')
      .send({
        id: null,
        isActive: true,
        permissions: [{ actionId, functionalityId, id: null }],
        translations: [
          { description: 'Perfil criado por e2e.', id: null, locale: 'pt', name: 'Perfil E2E' },
        ],
      })
      .expect(201);
    const profileId = (profile.body as ApiResponse<{ id: number }>).body.id;

    const user = await agent
      .post('/users')
      .send({
        clientId: 1,
        email: 'e2e-user@test.local',
        id: null,
        imageId: null,
        isActive: true,
        isBlocked: false,
        name: 'Usuário E2E',
        password: '123456',
        primaryPhone: '11999999999',
        profileId,
        secondaryPhone: null,
        userProfileId: null,
        username: 'e2e-user',
      })
      .expect(201);
    const userId = (user.body as ApiResponse<{ id: number }>).body.id;

    await agent.get(`/users/${userId}`).expect(200);
    await agent.post('/users/delete').send({ id: userId, ids: [] }).expect(201);
    await agent.post('/profiles/delete').send({ id: profileId, ids: [] }).expect(409);
    await agent.post('/actions/delete').send({ id: actionId, ids: [] }).expect(201);
    await agent.post('/functionalities/delete').send({ id: functionalityId, ids: [] }).expect(201);
    await agent.post('/modules/delete').send({ id: moduleId, ids: [] }).expect(201);
    await agent.post('/languages/delete').send({ id: languageId, ids: [] }).expect(201);
  });

  it('manages the current client and a complete country, state and city hierarchy', async () => {
    const currentClient = await agent.get('/clients/current').expect(200);
    const client = (currentClient.body as ApiResponse<Record<string, unknown>>).body;

    await agent.post('/clients').send(client).expect(201);

    const country = await agent
      .post('/countries')
      .send({
        currencyCode: null,
        id: null,
        isActive: true,
        iso2: 'XY',
        iso3: 'XYY',
        locale: null,
        phoneCode: null,
        translations: [{ id: null, locale: 'pt', name: 'País da hierarquia E2E' }],
      })
      .expect(201);
    const countryId = (country.body as ApiResponse<{ id: number }>).body.id;

    const state = await agent
      .post('/states')
      .send({
        code: 'TE',
        countryId,
        id: null,
        isActive: true,
        translations: [{ id: null, locale: 'pt', name: 'Estado da hierarquia E2E' }],
      })
      .expect(201);
    const stateId = (state.body as ApiResponse<{ id: number }>).body.id;

    const city = await agent
      .post('/cities')
      .send({
        ibgeCode: null,
        id: null,
        isActive: true,
        stateId,
        translations: [{ id: null, locale: 'pt', name: 'Cidade da hierarquia E2E' }],
      })
      .expect(201);
    const cityId = (city.body as ApiResponse<{ id: number }>).body.id;

    await agent.get(`/cities/${cityId}`).expect(200);
    await agent.post('/cities/delete').send({ id: cityId, ids: [] }).expect(201);
    await agent.post('/states/delete').send({ id: stateId, ids: [] }).expect(201);
    await agent.post('/countries/delete').send({ id: countryId, ids: [] }).expect(201);
  });

  it('lists job logs only from the global superuser context', async () => {
    const routine = await dataSource.getRepository(CronExecutionLog).save({
      durationMs: 10,
      error: null,
      finishedAt: new Date(),
      message: 'Routine log created by e2e.',
      startedAt: new Date(),
      status: CronExecutionStatus.success,
      taskName: 'e2e-routine',
      totalError: 0,
      totalProcessed: 1,
      totalSuccess: 1,
    });

    await agent.post('/system-admin/job-logs/list').send({}).expect(403);

    await dataSource.getRepository(User).update({ id: 1 }, { isSuperuser: true });

    const globalAgent = request.agent(httpServer);
    const authorization = await globalAgent
      .post('/auth/authorize')
      .send({ password: '123456', username: 'admin' })
      .expect(201);

    expect(
      (authorization.body as ApiResponse<{ isEligibleToGlobalContext: boolean }>).body,
    ).toMatchObject({ isEligibleToGlobalContext: true });

    const signIn = await globalAgent
      .post('/auth/sign-in-global')
      .send({ password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);
    const globalSession = signIn.body as ApiResponse<{
      session: { context: { type: SessionContextType }; user: { isSuperuser: boolean } };
    }>;

    expect(globalSession.body.session).toMatchObject({
      context: { type: SessionContextType.global },
      user: { isSuperuser: true },
    });

    await dataSource
      .getRepository(Profile)
      .update({ client: { id: secondaryClientId } }, { isAdmin: true });

    const assumed = await globalAgent
      .post('/auth/switch-client-as-superuser')
      .send({ clientId: secondaryClientId })
      .expect(201);
    const assumedSession = assumed.body as ApiResponse<{
      session: { context: { accessType: RequestLogAccessType; type: SessionContextType } };
    }>;

    expect(assumedSession.body.session.context).toMatchObject({
      accessType: RequestLogAccessType.superuser,
      type: SessionContextType.client,
    });

    await globalAgent.post('/auth/switch-global').send({}).expect(201);

    const response = await globalAgent.post('/system-admin/job-logs/list').send({}).expect(201);
    const logs = (response.body as ApiResponse<{ items: Array<{ id: number }> }>).body.items;

    expect(logs).toEqual(expect.arrayContaining([expect.objectContaining({ id: routine.id })]));
  });

  it('replaces all user access links and invalidates the affected user sessions', async () => {
    const primaryProfile = await dataSource.getRepository(Profile).findOneByOrFail({
      client: { id: 1 },
    });
    const secondaryProfile = await dataSource.getRepository(Profile).findOneByOrFail({
      client: { id: secondaryClientId },
    });
    const globalAgent = request.agent(httpServer);

    await globalAgent
      .post('/auth/sign-in-global')
      .send({ password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);

    const replacement = await globalAgent
      .post('/system-admin/users/1/access-links')
      .send({ links: [{ clientId: secondaryClientId, profileId: secondaryProfile.id }] })
      .expect(201);

    expect((replacement.body as ApiResponse<{ ids: number[] }>).body.ids).toHaveLength(1);
    await globalAgent.get('/auth/session').expect(401);

    const accessLinks = await dataSource.getRepository(UserProfile).find({
      relations: { client: true, profile: true },
      where: { user: { id: 1 } },
    });

    expect(
      accessLinks.map((link) => ({ clientId: link.client.id, profileId: link.profile.id })),
    ).toEqual([{ clientId: secondaryClientId, profileId: secondaryProfile.id }]);

    const emptyLinksAgent = request.agent(httpServer);

    await emptyLinksAgent
      .post('/auth/sign-in-global')
      .send({ password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);
    await emptyLinksAgent
      .post('/system-admin/users/1/access-links')
      .send({ links: [] })
      .expect(201);

    await expect(
      dataSource.getRepository(UserProfile).count({ where: { user: { id: 1 } } }),
    ).resolves.toBe(0);

    const restoreLinksAgent = request.agent(httpServer);

    await restoreLinksAgent
      .post('/auth/sign-in-global')
      .send({ password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);
    await restoreLinksAgent
      .post('/system-admin/users/1/access-links')
      .send({
        links: [
          { clientId: 1, profileId: primaryProfile.id },
          { clientId: secondaryClientId, profileId: secondaryProfile.id },
        ],
      })
      .expect(201);
    await agent
      .post('/auth/sign-in')
      .send({ clientId: 1, password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);
  });

  it('provisions a client, its administrative profile and all selected functionality permissions', async () => {
    const globalAgent = request.agent(httpServer);

    await globalAgent
      .post('/auth/sign-in-global')
      .send({ password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);

    const response = await globalAgent
      .post('/system-admin/clients')
      .send({
        adminProfile: {
          translations: [{ description: null, locale: 'pt', name: 'Administrador' }],
        },
        client: {
          address: 'Rua de Provisionamento',
          addressNumber: '1',
          cityId: null,
          corporateName: 'Cliente Provisionado LTDA',
          document: '33333333333',
          documentType: 'cpf',
          email: 'provisionado@test.local',
          id: null,
          imageId: null,
          isActive: true,
          languageLinks: [{ id: null, languageId: 1 }],
          neighborhood: 'Centro',
          primaryPhone: '11999999999',
          secondaryPhone: null,
          slug: 'cliente-provisionado-e2e',
          tradeName: 'Cliente Provisionado',
          zipCode: '01000000',
        },
        functionalities: [
          {
            icon: null,
            isNavigationGroup: false,
            languageIds: [1],
            moduleKey: 'administration',
            order: 1,
            parentSlug: null,
            slug: 'users',
            translations: [{ description: null, locale: 'pt', name: 'Usuários' }],
          },
        ],
        modules: [
          {
            key: 'administration',
            order: 1,
            translations: [{ description: null, locale: 'pt', name: 'Administração' }],
          },
        ],
      })
      .expect(201);
    const client = (response.body as ApiResponse<{ id: number }>).body;

    const [profile] = await dataSource.query<{ id: number }[]>(
      'SELECT id FROM perfis WHERE cliente_id = $1 AND eh_admin = true',
      [client.id],
    );
    const [{ permissionCount }] = await dataSource.query<{ permissionCount: string }[]>(
      'SELECT COUNT(*)::text AS "permissionCount" FROM perfis_permissoes WHERE perfil_id = $1',
      [profile.id],
    );

    expect(Number(permissionCount)).toBeGreaterThan(0);
  });

  it('switches the authenticated client and enforces the new profile permissions', async () => {
    const switched = await agent
      .post('/auth/switch-client')
      .send({ clientId: secondaryClientId })
      .expect(201);
    const body = switched.body as ApiResponse<{ session: { context: { client: { id: number } } } }>;

    expect(body.body.session.context.client.id).toBe(secondaryClientId);

    await agent.post('/users/list').send({ page: 1, pageSize: 10 }).expect(403);
  });

  it('invalidates the session at sign-out', async () => {
    await agent.post('/auth/sign-out').send({}).expect(201);
    await agent.get('/auth/session').expect(401);
  });

  it('preserves the current session and revokes the other sessions after a password change', async () => {
    const currentAgent = request.agent(httpServer);
    const otherAgent = request.agent(httpServer);

    await currentAgent
      .post('/auth/sign-in')
      .send({ clientId: 1, password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);
    await otherAgent
      .post('/auth/sign-in')
      .send({ clientId: 1, password: '123456', staySignedIn: false, username: 'admin' })
      .expect(201);

    await currentAgent
      .post('/users/me/password')
      .send({ currentPassword: '123456', newPassword: '654321' })
      .expect(201);

    await currentAgent.get('/auth/session').expect(200);
    await otherAgent.get('/auth/session').expect(401);
  });
});
