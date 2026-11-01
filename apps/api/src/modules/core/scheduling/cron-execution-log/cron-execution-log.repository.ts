import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, LessThanOrEqual, Repository } from 'typeorm';

import { CronExecutionLog } from './entities/cron-execution-log.entity';

@Injectable()
export class CronExecutionLogRepository {
  constructor(
    @InjectRepository(CronExecutionLog)
    private readonly logs: Repository<CronExecutionLog>,
  ) {}

  save(log: DeepPartial<CronExecutionLog>): Promise<CronExecutionLog> {
    return this.logs.save(log);
  }

  async deleteCreatedBefore(createdBefore: Date): Promise<number> {
    const result = await this.logs.delete({ createdAt: LessThanOrEqual(createdBefore) });

    return result.affected ?? 0;
  }
}
