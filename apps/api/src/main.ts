import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { configureApp } from '@/app.factory';
import { AppModule } from '@/app.module';
import { settings } from '@/infrastructure/config/app.config';
import { createAppLogger } from '@/infrastructure/logging/logger.config';
import { createSwaggerPath } from '@/infrastructure/swagger/swagger.config';

async function bootstrap(): Promise<void> {
  const logger = createAppLogger();
  const app = await NestFactory.create(AppModule, { logger });
  configureApp(app);
  app.enableShutdownHooks();

  await app.listen(settings.PORT);

  if (settings.SWAGGER_ENABLED) {
    const swaggerPath = `/${createSwaggerPath()}`;

    if (settings.NODE_ENV === 'development') {
      logger.log(
        `Swagger documentation: http://localhost:${settings.PORT}${swaggerPath}`,
        'Bootstrap',
      );
    } else {
      logger.log(`Swagger documentation route: ${swaggerPath}`, 'Bootstrap');
    }
  }
}

void bootstrap();
