import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';

import { RequestLog } from '../request-logs/entities/request-log.entity';

import { ClientLogsController } from './client-logs.controller';
import { ClientLogsRepository } from './client-logs.repository';
import { ClientLogsService } from './client-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestLog, CronExecutionLog])],
  controllers: [ClientLogsController],
  providers: [ClientLogsRepository, ClientLogsService],
})
export class ClientLogsModule {}
