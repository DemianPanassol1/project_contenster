import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SkipRequestLog } from '@/common/decorators/skip-request-log.decorator';

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
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async readiness(): Promise<ReadinessCheckResponse> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('Database is temporarily unavailable.');
    }

    return {
      dependencies: {
        database: 'ok',
      },
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
