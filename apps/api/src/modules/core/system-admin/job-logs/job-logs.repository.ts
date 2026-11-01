import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CronExecutionLog } from '@/modules/core/scheduling/cron-execution-log/entities/cron-execution-log.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

@Injectable()
export class JobLogsRepository {
  constructor(
    @InjectRepository(CronExecutionLog) private readonly logs: Repository<CronExecutionLog>,
  ) {}

  list(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.logs.createQueryBuilder('jobLog'), request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: {
        createdAt: 'jobLog.criado_em',
        status: 'jobLog.status',
        taskName: 'jobLog.nome_tarefa',
      },
      tieBreaker: 'jobLog.id',
    });
  }

  find(id: number): Promise<CronExecutionLog | null> {
    return this.logs.createQueryBuilder('jobLog').where('jobLog.id = :id', { id }).getOne();
  }
}
