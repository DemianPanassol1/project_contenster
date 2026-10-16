import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { configureApp } from '@/app.factory';
import { AppModule } from '@/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port);
}

void bootstrap();
