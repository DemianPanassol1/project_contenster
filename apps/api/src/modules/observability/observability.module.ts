import { Module } from '@nestjs/common';

import { ClientLogsModule } from './client-logs/client-logs.module';
import { RequestLogModule } from './request-logs/request-log.module';

@Module({
  imports: [RequestLogModule, ClientLogsModule],
  exports: [RequestLogModule],
})
export class ObservabilityModule {}
