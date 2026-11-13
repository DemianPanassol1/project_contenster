import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

const CLIENT_LIST_FIELDS = {
  corporateName: 'client.razao_social',
  document: 'client.documento',
  isActive: 'client.eh_ativo',
  tradeName: 'client.nome_fantasia',
};

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(UserProfile) private readonly userProfiles: Repository<UserProfile>,
  ) {}

  list(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(
      this.clients.createQueryBuilder('client').leftJoinAndSelect('client.image', 'image'),
      request,
      {
        defaultSort: [{ field: 'tradeName', direction: 'asc' }],
        fields: CLIENT_LIST_FIELDS,
        tieBreaker: 'client.id',
      },
    );
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

  findById(id: number): Promise<Client | null> {
    return this.clients.findOneBy({ id });
  }

  findAggregate(id: number): Promise<Client | null> {
    return this.clients.findOne({
      where: { id },
      relations: {
        city: true,
        image: true,
        availableLanguageLinks: { language: true },
        profiles: { translations: { language: true } },
        storageConfigurations: { credential: true },
        storageFileTypeRules: { storageConfiguration: true },
      },
    });
  }

  save(client: Client): Promise<Client> {
    return this.clients.save(client);
  }

  softDelete(client: Client): Promise<Client> {
    return this.clients.softRemove(client);
  }
}
