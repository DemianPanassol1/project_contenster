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
import { AccessControlModule } from '@/modules/access-control/access-control.module';
import { ActionsModule } from '@/modules/authorization/actions/actions.module';
import { AuthorizationModule } from '@/modules/authorization/authorization.module';
import { CommunicationModule } from '@/modules/communication/communication.module';
import { IdentityModule } from '@/modules/identity/identity.module';
import { LocationsModule } from '@/modules/locations/locations.module';
import { MediaModule } from '@/modules/media/media.module';
import { ObservabilityModule } from '@/modules/observability/observability.module';
import { SchedulingModule } from '@/modules/scheduling/scheduling.module';
import { SystemAdminModule } from '@/modules/system-admin/system-admin.module';

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
    ObservabilityModule,
    MediaModule,
    IdentityModule,
    AccessControlModule,
    AuthorizationModule,
    ActionsModule,
    CommunicationModule,
    LocationsModule,
    SchedulingModule,
    SystemAdminModule,
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
