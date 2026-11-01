import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestLog } from '../request-logs/entities/request-log.entity';

import { ClientLogsController } from './client-logs.controller';
import { ClientLogsRepository } from './client-logs.repository';
import { ClientLogsService } from './client-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  controllers: [ClientLogsController],
  providers: [ClientLogsRepository, ClientLogsService],
})
export class ClientLogsModule {}
