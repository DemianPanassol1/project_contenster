import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { settings } from '@/infrastructure/config/app.config';

const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '');

const apiVersionSegment = (): string | null => {
  if (!settings.API_VERSION) return null;

  return settings.API_VERSION.startsWith('v') ? settings.API_VERSION : `v${settings.API_VERSION}`;
};

const joinPathSegments = (...segments: Array<string | null>): string => {
  const path = segments.map((segment) => (segment ? trimSlashes(segment) : '')).filter(Boolean);

  return path.length > 0 ? `/${path.join('/')}` : '/';
};

export const createSwaggerPath = (): string =>
  trimSlashes(joinPathSegments(settings.API_PREFIX, apiVersionSegment(), settings.SWAGGER_PATH));

export const setupSwagger = (app: INestApplication): void => {
  if (!settings.SWAGGER_ENABLED) return;

  const documentConfig = new DocumentBuilder()
    .setTitle(settings.APP_NAME)
    .setVersion(settings.API_VERSION ?? '1')
    .addServer('/', 'Current host')
    .addCookieAuth(
      'contenster_session',
      { in: 'cookie', name: 'contenster_session', type: 'apiKey' },
      'session-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);

  SwaggerModule.setup(createSwaggerPath(), app, document, {
    customSiteTitle: `${settings.APP_NAME} Docs`,
    swaggerOptions: {
      persistAuthorization: settings.SWAGGER_PERSIST_AUTHORIZATION,
    },
  });
};
