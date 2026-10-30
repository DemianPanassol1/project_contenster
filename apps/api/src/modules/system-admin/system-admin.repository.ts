import type { AppOption, PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { RequestLog } from '@/modules/observability/request-logs/entities/request-log.entity';
import { CronExecutionLog } from '@/modules/scheduling/cron-execution-log/entities/cron-execution-log.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

const CLIENT_LIST_FIELDS = {
  corporateName: 'client.razao_social',
  document: 'client.documento',
  isActive: 'client.eh_ativo',
  tradeName: 'client.nome_fantasia',
};

@Injectable()
export class SystemAdminRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(CronExecutionLog) private readonly jobLogs: Repository<CronExecutionLog>,
    @InjectRepository(RequestLog) private readonly requestLogs: Repository<RequestLog>,
    @InjectRepository(UserProfile) private readonly userProfiles: Repository<UserProfile>,
  ) {}

  listClients(request: PaginateRequest) {
    const query = this.clients
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.image', 'image');

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'tradeName', direction: 'asc' }],
      fields: CLIENT_LIST_FIELDS,
      tieBreaker: 'client.id',
    });
  }

  async countUsersByClientIds(clientIds: number[]): Promise<Map<number, number>> {
    if (clientIds.length === 0) {
      return new Map();
    }

    const rows = await this.userProfiles
      .createQueryBuilder('userProfile')
      .innerJoin('userProfile.user', 'user', 'user.deletado_em IS NULL')
      .select('userProfile.cliente_id', 'clientId')
      .addSelect('COUNT(userProfile.id)', 'userCount')
      .where('userProfile.cliente_id IN (:...clientIds)', { clientIds })
      .groupBy('userProfile.cliente_id')
      .getRawMany<{ clientId: string; userCount: string }>();

    return new Map(rows.map((row) => [Number(row.clientId), Number(row.userCount)]));
  }

  findClient(id: number) {
    return this.clients.findOneBy({ id });
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

  requestLogsQuery() {
    return this.requestLogs
      .createQueryBuilder('requestLog')
      .withDeleted()
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

  findRequestLog(id: number) {
    return this.requestLogs
      .createQueryBuilder('requestLog')
      .withDeleted()
      .leftJoinAndSelect('requestLog.client', 'client')
      .leftJoinAndSelect('requestLog.user', 'user')
      .where('requestLog.id = :id', { id })
      .getOne();
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

  findJobLog(id: number): Promise<CronExecutionLog | null> {
    return this.jobLogs.createQueryBuilder('jobLog').where('jobLog.id = :id', { id }).getOne();
  }

  async listRequestLogClientOptions(request: PaginateRequest): Promise<AppOption[]> {
    const [clients] = await applyPaginatedQueryBuilder(
      this.clients.createQueryBuilder('client').withDeleted(),
      request,
      {
        defaultSort: [{ field: 'tradeName', direction: 'asc' }],
        fields: CLIENT_LIST_FIELDS,
        tieBreaker: 'client.id',
      },
    );

    return clients.map((client) => ({
      disabled: false,
      label: `${client.tradeName} (${client.document})${client.deletedAt ? ' — excluído' : ''}`,
      metadata: { isDeleted: Boolean(client.deletedAt) },
      value: client.id,
    }));
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

  findAccessLinkUser(id: number, manager: EntityManager): Promise<User | null> {
    return manager.getRepository(User).findOneBy({ id });
  }

  findAccessLinkClients(ids: number[], manager: EntityManager): Promise<Client[]> {
    if (ids.length === 0) return Promise.resolve([]);

    return manager.getRepository(Client).find({ where: { id: In(ids) } });
  }

  findAccessLinkProfiles(ids: number[], manager: EntityManager): Promise<Profile[]> {
    if (ids.length === 0) return Promise.resolve([]);

    return manager.getRepository(Profile).find({
      relations: { client: true },
      where: { id: In(ids) },
    });
  }

  findAccessLinksByUser(userId: number, manager: EntityManager): Promise<UserProfile[]> {
    return manager.getRepository(UserProfile).find({
      relations: { client: true, profile: true },
      where: { user: { id: userId } },
    });
  }

  async replaceAccessLinks(
    userId: number,
    links: Array<{ clientId: number; profileId: number }>,
    manager: EntityManager,
  ): Promise<UserProfile[]> {
    const userProfiles = manager.getRepository(UserProfile);

    await userProfiles.delete({ user: { id: userId } });

    if (links.length === 0) return [];

    return userProfiles.save(
      links.map(({ clientId, profileId }) => ({
        client: { id: clientId },
        profile: { id: profileId },
        user: { id: userId },
      })),
    );
  }
}
