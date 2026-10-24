import type { Server } from 'node:http';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApplication } from '../runner/app.factory';

interface HealthResponseBody {
  body: {
    status: string;
  };
  errors: {
    count: number;
    items: unknown[];
  };
  lang: string;
  requestId: string;
  statusCode: number;
}

interface PublicPortalResponseBody {
  body: {
    identity: { applicationName: string };
    login: { headerMode: string; layout: string };
  };
}

describe('Application smoke', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApplication();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('responds to the health endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/health')
      .expect(200);
    const body = response.body as HealthResponseBody;

    expect(body).toMatchObject({
      body: {
        status: 'ok',
      },
      errors: {
        count: 0,
        items: [],
      },
      lang: 'pt',
      statusCode: 200,
    });
    expect(body.requestId).toEqual(expect.any(String));
  });

  it('returns the public portal fallback when the Host has no configured portal', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/public/portal')
      .set('Host', 'unknown-portal.test')
      .expect(200);

    const body = response.body as PublicPortalResponseBody;

    expect(body.body).toMatchObject({
      identity: { applicationName: 'Contenster Slim Core' },
      login: { headerMode: 'text', layout: 'centered' },
    });
  });
});
