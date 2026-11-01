import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestLog } from './entities/request-log.entity';
import { RequestLogRepository } from './request-log.repository';
import { RequestLogService } from './request-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [RequestLogRepository, RequestLogService],
  exports: [RequestLogRepository, RequestLogService],
})
export class RequestLogModule {}
