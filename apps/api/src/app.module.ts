import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { I18nModule } from 'nestjs-i18n';

import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { createI18nOptions } from '@/i18n/i18n.config';
import { settings } from '@/infrastructure/config/app.config';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { HealthController } from '@/infrastructure/health/health.controller';
import { RedisModule } from '@/infrastructure/redis';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: settings.THROTTLE_TTL_MS,
        limit: settings.THROTTLE_LIMIT,
      },
    ]),
    I18nModule.forRoot(createI18nOptions()),
    DatabaseModule,
    RedisModule,
  ],
  controllers: [HealthController],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
