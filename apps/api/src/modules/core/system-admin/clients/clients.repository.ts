import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, EntityManager, In, Repository } from 'typeorm';

import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';
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
    @InjectRepository(Language) private readonly languages: Repository<Language>,
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

  findLanguagesByIds(ids: number[], manager?: EntityManager): Promise<Language[]> {
    return (manager?.getRepository(Language) ?? this.languages).find({ where: { id: In(ids) } });
  }

  save(client: Client): Promise<Client> {
    return this.clients.save(client);
  }

  softDelete(client: Client): Promise<Client> {
    return this.clients.softRemove(client);
  }

  saveClient(data: DeepPartial<Client>, manager: EntityManager): Promise<Client> {
    return manager.getRepository(Client).save(data);
  }

  saveProfile(data: DeepPartial<Profile>, manager: EntityManager): Promise<Profile> {
    return manager.getRepository(Profile).save(data);
  }
}
