import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, LessThanOrEqual, Repository } from 'typeorm';

import { RequestLogLevel } from '@contenster/shared';

import { RequestLog } from './entities/request-log.entity';

@Injectable()
export class RequestLogRepository {
  constructor(@InjectRepository(RequestLog) private readonly repository: Repository<RequestLog>) {}

  save(log: DeepPartial<RequestLog>): Promise<RequestLog> {
    return this.repository.save(log);
  }

  async deleteByLevelAndCreatedAt(level: RequestLogLevel, createdBefore: Date): Promise<number> {
    const result = await this.repository.delete({
      level,
      createdAt: LessThanOrEqual(createdBefore),
    });

    return result.affected ?? 0;
  }
}
