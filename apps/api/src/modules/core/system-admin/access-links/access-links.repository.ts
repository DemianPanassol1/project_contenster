import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { User } from '@/modules/core/identity/users/entities/user.entity';
import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

@Injectable()
export class AccessLinksRepository {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  listUserOptions(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(this.users.createQueryBuilder('user'), request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: { email: 'user.email', name: 'user.nome', username: 'user.nome_usuario' },
      tieBreaker: 'user.id',
    });
  }

  findUserDetails(id: number): Promise<User | null> {
    return this.users.findOne({
      relations: { userProfiles: { client: true, profile: { translations: { language: true } } } },
      where: { id },
    });
  }

  listClients(): Promise<Client[]> {
    return this.clients.find({
      order: { tradeName: 'ASC' },
      relations: { profiles: { translations: { language: true } } },
    });
  }

  findUser(id: number, manager: EntityManager): Promise<User | null> {
    return manager
      .getRepository(User)
      .findOne({ relations: { userProfiles: true }, where: { id } });
  }

  findClients(ids: number[], manager: EntityManager): Promise<Client[]> {
    return ids.length
      ? manager.getRepository(Client).find({ where: { id: In(ids) } })
      : Promise.resolve([]);
  }

  findProfiles(ids: number[], manager: EntityManager): Promise<Profile[]> {
    return ids.length
      ? manager.getRepository(Profile).find({ relations: { client: true }, where: { id: In(ids) } })
      : Promise.resolve([]);
  }

  findByUser(userId: number, manager: EntityManager): Promise<UserProfile[]> {
    return manager
      .getRepository(UserProfile)
      .find({ relations: { client: true, profile: true }, where: { user: { id: userId } } });
  }

  async replace(
    user: User,
    links: Array<{ clientId: number; id: number | null; profileId: number }>,
    manager: EntityManager,
  ): Promise<UserProfile[]> {
    user.userProfiles = links.map(({ clientId, id, profileId }) =>
      manager.create(UserProfile, {
        ...(id === null ? {} : { id }),
        client: { id: clientId },
        profile: { id: profileId },
      }),
    );
    return (await manager.getRepository(User).save(user)).userProfiles;
  }
}
