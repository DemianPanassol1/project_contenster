import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

@Injectable()
export class ClientLogsRepository {
  constructor(@InjectRepository(RequestLog) private readonly requestLogs: Repository<RequestLog>) {}

  listRequestLogs(clientId: number, request: PaginateRequest): Promise<[RequestLog[], number]> {
    const query = this.requestLogs
      .createQueryBuilder('requestLog')
      .leftJoinAndSelect('requestLog.user', 'user')
      .leftJoinAndSelect('requestLog.client', 'client')
      .where('requestLog.cliente_id = :clientId', { clientId });

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: REQUEST_LOG_FIELDS,
      tieBreaker: 'requestLog.id',
    });
  }

  findRequestLog(clientId: number, id: number): Promise<RequestLog | null> {
    return this.requestLogs
      .createQueryBuilder('requestLog')
      .leftJoinAndSelect('requestLog.user', 'user')
      .leftJoinAndSelect('requestLog.client', 'client')
      .where('requestLog.id = :id', { id })
      .andWhere('requestLog.cliente_id = :clientId', { clientId })
      .getOne();
  }
}
