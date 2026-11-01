import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { RequestLog } from '@/modules/core/observability/request-logs/entities/request-log.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

const CLIENT_FIELDS = {
  corporateName: 'client.razao_social',
  document: 'client.documento',
  isActive: 'client.eh_ativo',
  tradeName: 'client.nome_fantasia',
};

@Injectable()
export class RequestLogsRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(RequestLog) private readonly logs: Repository<RequestLog>,
  ) {}

  list(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.query(), request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: {
        accessType: 'requestLog.tipo_acesso',
        clientId: 'client.id',
        createdAt: 'requestLog.criado_em',
        ip: 'requestLog.ip',
        level: 'requestLog.nivel',
        method: 'requestLog.metodo_http',
        route: 'requestLog.rota',
        statusCode: 'requestLog.status_code',
        userName: 'user.nome',
      },
      tieBreaker: 'requestLog.id',
    });
  }

  find(id: number) {
    return this.query().where('requestLog.id = :id', { id }).getOne();
  }

  listClientOptions(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(
      this.clients.createQueryBuilder('client').withDeleted(),
      request,
      {
        defaultSort: [{ field: 'tradeName', direction: 'asc' }],
        fields: CLIENT_FIELDS,
        tieBreaker: 'client.id',
      },
    );
  }

  private query() {
    return this.logs
      .createQueryBuilder('requestLog')
      .withDeleted()
      .leftJoinAndSelect('requestLog.client', 'client')
      .leftJoinAndSelect('requestLog.user', 'user');
  }
}
