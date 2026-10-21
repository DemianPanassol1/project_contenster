import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';

import { RequestLog } from '../request-logs/entities/request-log.entity';

const REQUEST_LOG_FIELDS: QueryFieldMap = {
  createdAt: 'requestLog.criado_em',
  ip: 'requestLog.ip',
  level: 'requestLog.nivel',
  method: 'requestLog.metodo_http',
  route: 'requestLog.rota',
  statusCode: 'requestLog.status_code',
  userName: 'user.nome',
};

const ROUTINE_LOG_FIELDS: QueryFieldMap = {
  createdAt: 'routineLog.criado_em',
  status: 'routineLog.status',
  taskName: 'routineLog.nome_rotina',
};

@Injectable()
export class ClientLogsRepository {
  constructor(
    @InjectRepository(RequestLog) private readonly requestLogs: Repository<RequestLog>,
    @InjectRepository(CronExecutionLog) private readonly routineLogs: Repository<CronExecutionLog>,
  ) {}

  listRequestLogs(clientId: number, request: PaginateRequest): Promise<[RequestLog[], number]> {
    const query = this.requestLogs
      .createQueryBuilder('requestLog')
      .leftJoinAndSelect('requestLog.user', 'user')
      .leftJoinAndSelect('requestLog.client', 'client')
      .where(
        new Brackets((where) => {
          where.where('requestLog.cliente_id = :clientId', { clientId });
          where.orWhere('requestLog.cliente_id IS NULL');
        }),
      );

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: REQUEST_LOG_FIELDS,
      tieBreaker: 'requestLog.id',
    });
  }

  listRoutineLogs(request: PaginateRequest): Promise<[CronExecutionLog[], number]> {
    const query = this.routineLogs.createQueryBuilder('routineLog');

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: ROUTINE_LOG_FIELDS,
      tieBreaker: 'routineLog.id',
    });
  }

  findRequestLog(clientId: number, id: number): Promise<RequestLog | null> {
    return this.requestLogs
      .createQueryBuilder('requestLog')
      .leftJoinAndSelect('requestLog.user', 'user')
      .leftJoinAndSelect('requestLog.client', 'client')
      .where('requestLog.id = :id', { id })
      .andWhere(
        new Brackets((where) => {
          where.where('requestLog.cliente_id = :clientId', { clientId });
          where.orWhere('requestLog.cliente_id IS NULL');
        }),
      )
      .getOne();
  }

  findRoutineLog(id: number): Promise<CronExecutionLog | null> {
    return this.routineLogs
      .createQueryBuilder('routineLog')
      .where('routineLog.id = :id', { id })
      .getOne();
  }
}
