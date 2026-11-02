import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, EntityManager, In, Repository } from 'typeorm';

import { Functionality } from '@/modules/core/access-control/functionalities/entities/functionality.entity';
import { SystemModule } from '@/modules/core/access-control/modules/entities/system-module.entity';
import { ProfilePermission } from '@/modules/core/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { Action } from '@/modules/core/system-admin/actions/entities/action.entity';
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
    @InjectRepository(Action) private readonly actions: Repository<Action>,
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

  findWithLanguages(id: number): Promise<Client | null> {
    return this.clients.findOne({ where: { id }, relations: { availableLanguageLinks: true } });
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

  saveModule(data: DeepPartial<SystemModule>, manager: EntityManager): Promise<SystemModule> {
    return manager.getRepository(SystemModule).save(data);
  }

  saveFunctionality(
    data: DeepPartial<Functionality>,
    manager: EntityManager,
  ): Promise<Functionality> {
    return manager.getRepository(Functionality).save(data);
  }

  saveProfile(data: DeepPartial<Profile>, manager: EntityManager): Promise<Profile> {
    return manager.getRepository(Profile).save(data);
  }

  findActions(manager: EntityManager): Promise<Action[]> {
    return manager.getRepository(Action).find();
  }

  saveProfilePermissions(
    data: DeepPartial<ProfilePermission>[],
    manager: EntityManager,
  ): Promise<ProfilePermission[]> {
    return manager.getRepository(ProfilePermission).save(data);
  }
}
