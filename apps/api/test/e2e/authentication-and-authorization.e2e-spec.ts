import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import request, { type Agent } from 'supertest';
import { DataSource } from 'typeorm';

import { CronExecutionStatus, FileType, StorageProvider } from '@contenster/shared';
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
      context: { client: { id: number } };
      user: { id: number };
    }>;

    expect(current.body.user.id).toBe(1);
    expect(current.body.context.client.id).toBe(1);

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

  it('lists routine logs separately from request logs', async () => {
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

    const response = await agent.post('/client-logs/routines/list').send({}).expect(201);
    const logs = (response.body as ApiResponse<{ items: Array<{ id: number }> }>).body.items;

    expect(logs).toEqual(expect.arrayContaining([expect.objectContaining({ id: routine.id })]));
    await agent.get(`/client-logs/routines/${routine.id}`).expect(200);
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

  it('synchronizes the session and invalidates it at sign-out', async () => {
    const synchronized = await agent.post('/auth/session/sync').send({}).expect(201);

    expect(
      (synchronized.body as ApiResponse<{ session: { context: { client: { id: number } } } }>).body
        .session.context.client.id,
    ).toBe(secondaryClientId);

    await agent.post('/auth/sign-out').send({}).expect(201);
    await agent.get('/auth/session').expect(401);
  });
});
