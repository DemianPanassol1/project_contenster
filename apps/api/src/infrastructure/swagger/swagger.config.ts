import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { settings } from '@/infrastructure/config/app.config';

const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '');

export const createSwaggerPath = (): string => trimSlashes(settings.SWAGGER_PATH);

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
