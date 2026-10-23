import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from '@/modules/identity/clients/entities/client.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { RequestLog } from '@/modules/observability/request-logs/entities/request-log.entity';
import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

@Injectable()
export class SystemAdminRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(CronExecutionLog) private readonly jobLogs: Repository<CronExecutionLog>,
    @InjectRepository(RequestLog) private readonly requestLogs: Repository<RequestLog>,
  ) {}

  listClients() {
    return this.clients.find({ withDeleted: false, order: { tradeName: 'ASC' } });
  }

  findClient(id: number) {
    return this.clients.findOneBy({ id });
  }

  findActiveClient(id: number) {
    return this.clients.findOneBy({ id, isActive: true });
  }

  findClientWithLanguages(id: number) {
    return this.clients.findOne({ where: { id }, relations: { availableLanguageLinks: true } });
  }

  saveClient(client: Client) {
    return this.clients.save(client);
  }

  softDeleteClient(client: Client) {
    return this.clients.softRemove(client);
  }

  listRequestLogs(clientId?: number) {
    const query = this.requestLogs
      .createQueryBuilder('requestLog')
      .leftJoinAndSelect('requestLog.client', 'client')
      .leftJoinAndSelect('requestLog.user', 'user')
      .orderBy('requestLog.criado_em', 'DESC')
      .take(100);

    if (clientId !== undefined) {
      query.where('requestLog.cliente_id = :clientId', { clientId });
    }

    return query.getMany();
  }

  requestLogsQuery() {
    return this.requestLogs
      .createQueryBuilder('requestLog')
      .leftJoinAndSelect('requestLog.client', 'client')
      .leftJoinAndSelect('requestLog.user', 'user');
  }

  listRequestLogsPaginated(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.requestLogsQuery(), request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: {
        accessType: 'requestLog.tipo_acesso',
        clientId: 'client.id',
        createdAt: 'requestLog.criado_em',
        level: 'requestLog.nivel',
        route: 'requestLog.rota',
      },
      tieBreaker: 'requestLog.id',
    });
  }

  listJobLogs() {
    return this.jobLogs.find({ order: { createdAt: 'DESC' }, take: 100 });
  }

  jobLogsQuery() {
    return this.jobLogs.createQueryBuilder('jobLog');
  }

  listJobLogsPaginated(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.jobLogsQuery(), request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: {
        createdAt: 'jobLog.criado_em',
        status: 'jobLog.status',
        taskName: 'jobLog.nome_tarefa',
      },
      tieBreaker: 'jobLog.id',
    });
  }

  listFiles(clientId?: number) {
    const query = this.files
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.client', 'client')
      .orderBy('file.criado_em', 'DESC')
      .take(100);

    if (clientId !== undefined) {
      query.where('file.cliente_id = :clientId', { clientId });
    }

    return query.getMany();
  }

  filesQuery() {
    return this.files.createQueryBuilder('file').leftJoinAndSelect('file.client', 'client');
  }

  listFilesPaginated(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.filesQuery(), request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: {
        clientId: 'client.id',
        createdAt: 'file.criado_em',
        originalName: 'file.nome_original',
        sizeInBytes: 'file.tamanho_bytes',
      },
      tieBreaker: 'file.id',
    });
  }
}
