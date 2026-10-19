import type { ServerResponse } from 'node:http';
import { extname, resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { I18nModule } from 'nestjs-i18n';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { RequestLogInterceptor } from '@/common/interceptors/request-log.interceptor';
import { createI18nOptions } from '@/i18n/i18n.config';
import { settings, WORKSPACE_ROOT_PATH } from '@/infrastructure/config/app.config';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { HealthController } from '@/infrastructure/health/health.controller';
import { RedisModule } from '@/infrastructure/redis';
import { IdentityModule } from '@/modules/identity/identity.module';
import { LocationsModule } from '@/modules/locations/locations.module';
import { MediaModule } from '@/modules/media/media.module';
import { RequestLogModule } from '@/modules/observability/request-logs/request-log.module';
import { SchedulingModule } from '@/modules/scheduling/scheduling.module';

const createUploadsServeRoot = (): string => {
  const baseUrl = settings.UPLOADS_PUBLIC_BASE_URL;

  if (!baseUrl.startsWith('http')) {
    return baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  }

  return new URL(baseUrl).pathname;
};

const setUploadResponseHeaders = (response: ServerResponse, filePath: string): void => {
  if (extname(filePath).toLowerCase() !== '.svg') return;

  response.setHeader('Content-Security-Policy', "sandbox; default-src 'none'; img-src data:");
  response.setHeader('X-Content-Type-Options', 'nosniff');
};

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: settings.THROTTLE_TTL_MS,
        limit: settings.THROTTLE_LIMIT,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: resolve(WORKSPACE_ROOT_PATH, settings.UPLOADS_LOCAL_ROOT_PATH),
      serveRoot: createUploadsServeRoot(),
      serveStaticOptions: {
        setHeaders: setUploadResponseHeaders,
      },
    }),
    I18nModule.forRoot(createI18nOptions()),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    RequestLogModule,
    MediaModule,
    IdentityModule,
    LocationsModule,
    SchedulingModule,
  ],
  controllers: [HealthController],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLogInterceptor,
    },
  ],
})
export class AppModule {}
