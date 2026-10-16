import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { configureApp } from '@/app.factory';
import { AppModule } from '@/app.module';

export async function createTestApplication(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();

  return app;
}
