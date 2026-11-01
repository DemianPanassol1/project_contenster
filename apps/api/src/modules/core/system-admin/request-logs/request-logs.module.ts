import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { RequestLog } from '@/modules/core/observability/request-logs/entities/request-log.entity';

import { RequestLogsController } from './request-logs.controller';
import { RequestLogsRepository } from './request-logs.repository';
import { RequestLogsService } from './request-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, RequestLog])],
  controllers: [RequestLogsController],
  providers: [RequestLogsRepository, RequestLogsService],
})
export class RequestLogsModule {}
