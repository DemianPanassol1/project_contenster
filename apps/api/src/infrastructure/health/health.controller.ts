import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { DataSource } from 'typeorm';

import { SkipRequestLog } from '@/common/decorators/skip-request-log.decorator';
import type { I18nTranslations } from '@/i18n/translations';
import { serializeApplicationDateTime } from '@/infrastructure/date-time';

interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

interface ReadinessCheckResponse extends HealthCheckResponse {
  dependencies: {
    database: 'ok';
  };
}

@SkipRequestLog()
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: serializeApplicationDateTime(new Date()),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async readiness(): Promise<ReadinessCheckResponse> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException(
        this.i18n.t('errors.infrastructure.database_unavailable'),
      );
    }

    return {
      dependencies: {
        database: 'ok',
      },
      status: 'ok',
      timestamp: serializeApplicationDateTime(new Date()),
      uptime: process.uptime(),
    };
  }
}
