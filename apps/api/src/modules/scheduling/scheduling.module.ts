import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileModule } from '@/modules/media/files/file.module';
import { StorageModule } from '@/modules/media/storage/storage.module';
import { RequestLogModule } from '@/modules/observability/request-logs/request-log.module';

import { CronExecutionLogRepository } from './cron-execution-log/cron-execution-log.repository';
import { CronExecutionLogService } from './cron-execution-log/cron-execution-log.service';
import { CronExecutionLog } from './cron-execution-log/entities/cron-execution-log.entity';
import { CronLogCleanupService } from './cron-log-cleanup/cron-log-cleanup.service';
import { FileCleanupService } from './file-cleanup/file-cleanup.service';
import { RequestLogCleanupService } from './request-log-cleanup/request-log-cleanup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CronExecutionLog]),
    FileModule,
    RequestLogModule,
    StorageModule,
  ],
  providers: [
    CronExecutionLogRepository,
    CronExecutionLogService,
    CronLogCleanupService,
    FileCleanupService,
    RequestLogCleanupService,
  ],
  exports: [CronExecutionLogService],
})
export class SchedulingModule {}
