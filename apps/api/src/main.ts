import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { configureApp } from '@/app.factory';
import { AppModule } from '@/app.module';
import { settings } from '@/infrastructure/config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  await app.listen(settings.PORT);
}

void bootstrap();
