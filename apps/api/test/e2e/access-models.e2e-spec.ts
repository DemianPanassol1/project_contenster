import type { Server } from 'node:http';
import type { AccessModelPreviewResponse, GetAccessModelByIdResponse } from '@contenster/shared';
import type { INestApplication } from '@nestjs/common';
import { hash } from 'argon2';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { User } from '@/modules/core/identity/users/entities/user.entity';

import { createTestApplication } from '../runner/app.factory';

describe('access models HTTP authorization and synchronization', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApplication();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('requires authentication and creates, edits, previews and applies a model as superuser', async () => {
    const server = app.getHttpServer() as Server;

    await request(server)
      .post('/system-admin/access-models/preview')
      .send({ modelId: 1, clientId: 1 })
      .expect(401);

    const users = app.get(DataSource).getRepository(User);
    const original = await users.findOneByOrFail({ id: 1 });

    await users.update(
      { id: 1 },
      { isSuperuser: true, isActive: true, isBlocked: false, passwordHash: await hash('123456') },
    );
    const agent = request.agent(server);

    try {
      await agent
        .post('/auth/sign-in-global')
        .send({ username: 'admin', password: '123456', staySignedIn: false })
        .expect(201);
      const created = await agent
        .post('/system-admin/access-models')
        .send({
          id: null,
          isActive: true,
          translations: [{ id: null, locale: 'pt', name: 'HTTP model', description: null }],
          structure: { modules: [] },
        })
        .expect(201);
      const model = (created.body as { body: GetAccessModelByIdResponse }).body;

      await agent
        .post('/system-admin/access-models')
        .send({
          id: model.id,
          isActive: true,
          translations: model.translations,
          structure: model.structure,
        })
        .expect(201);
      const preview = await agent
        .post('/system-admin/access-models/preview')
        .send({ modelId: model.id, clientId: 1 })
        .expect(201);

      const clientAgent = request.agent(server);
      await clientAgent
        .post('/auth/sign-in')
        .send({ username: 'admin', password: '123456', clientId: 1, staySignedIn: false })
        .expect(201);
      const clientPreview = await clientAgent
        .post('/access-models/preview')
        .send({ modelId: model.id })
        .expect(201);
      expect((clientPreview.body as { body: AccessModelPreviewResponse }).body.fingerprint).toBe(
        (preview.body as { body: AccessModelPreviewResponse }).body.fingerprint,
      );
      await clientAgent.post('/system-admin/access-models').send({ id: null }).expect(403);

      await agent
        .post('/system-admin/access-models/apply')
        .send({
          modelId: model.id,
          clientId: 1,
          fingerprint: (preview.body as { body: AccessModelPreviewResponse }).body.fingerprint,
          selectedChangeIds: [],
        })
        .expect(201);
      await agent
        .post('/system-admin/access-models')
        .send({
          id: model.id,
          isActive: false,
          translations: model.translations,
          structure: model.structure,
        })
        .expect(201);

      for (const [locale, message] of [
        ['pt', 'O modelo de acesso está inativo.'],
        ['en', 'Access model is inactive.'],
        ['es', 'El modelo de acceso está inactivo.'],
      ]) {
        const rejected = await agent
          .post('/system-admin/access-models/preview')
          .set('x-lang', locale)
          .send({ modelId: model.id, clientId: 1 })
          .expect(400);

        expect(JSON.stringify(rejected.body)).toContain(message);
      }

      await agent.post('/system-admin/access-models/delete').send({ id: model.id }).expect(201);
    } finally {
      await users.update(
        { id: 1 },
        {
          isSuperuser: original.isSuperuser,
          isActive: original.isActive,
          isBlocked: original.isBlocked,
          passwordHash: original.passwordHash,
        },
      );
    }
  });
});
