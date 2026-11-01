import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CronExecutionLog } from '@/modules/core/scheduling/cron-execution-log/entities/cron-execution-log.entity';

import { JobLogsController } from './job-logs.controller';
import { JobLogsRepository } from './job-logs.repository';
import { JobLogsService } from './job-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([CronExecutionLog])],
  controllers: [JobLogsController],
  providers: [JobLogsRepository, JobLogsService],
})
export class JobLogsModule {}
