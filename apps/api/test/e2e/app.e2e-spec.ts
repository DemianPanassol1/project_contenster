import type { Server } from 'node:http';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApplication } from '../runner/app.factory';

describe('Application smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApplication();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds to the health endpoint', async () => {
    await request(app.getHttpServer() as Server)
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
