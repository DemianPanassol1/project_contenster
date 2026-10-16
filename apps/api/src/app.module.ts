import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { I18nModule } from 'nestjs-i18n';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { RequestLogInterceptor } from '@/common/interceptors/request-log.interceptor';
import { createI18nOptions } from '@/i18n/i18n.config';
import { settings } from '@/infrastructure/config/app.config';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { HealthController } from '@/infrastructure/health/health.controller';
import { RedisModule } from '@/infrastructure/redis';
import { MediaModule } from '@/modules/media/media.module';
import { RequestLogModule } from '@/modules/observability/request-logs/request-log.module';
import { SchedulingModule } from '@/modules/scheduling/scheduling.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: settings.THROTTLE_TTL_MS,
        limit: settings.THROTTLE_LIMIT,
      },
    ]),
    I18nModule.forRoot(createI18nOptions()),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    RequestLogModule,
    MediaModule,
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
