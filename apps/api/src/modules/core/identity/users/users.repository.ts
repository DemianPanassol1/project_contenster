import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type EntityManager, IsNull, Repository } from 'typeorm';

import type { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';

import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

const LIST_FIELDS: QueryFieldMap = {
  email: 'user.email',
  id: 'user.id',
  isActive: 'user.eh_ativo',
  isBlocked: 'user.eh_bloqueado',
  name: 'user.nome',
  username: 'user.nome_usuario',
};

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile) private readonly userProfiles: Repository<UserProfile>,
  ) {}

  list(clientId: number, request: PaginateRequest): Promise<[User[], number]> {
    const query = this.users
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'user.userProfiles',
        'userProfile',
        'userProfile.cliente_id = :clientId',
        { clientId },
      )
      .leftJoinAndSelect('userProfile.profile', 'profile');
    return applyPaginatedQueryBuilder<User>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'user.id',
    });
  }

  findById(clientId: number, id: number, manager?: EntityManager): Promise<User | null> {
    return (manager?.getRepository(User) ?? this.users).findOne({
      where: { id, userProfiles: { client: { id: clientId } } },
      relations: { image: true, userProfiles: { client: true, profile: true } },
    });
  }

  findByIds(clientId: number, ids: number[]): Promise<User[]> {
    return this.users
      .createQueryBuilder('user')
      .innerJoin('user.userProfiles', 'userProfile', 'userProfile.cliente_id = :clientId', {
        clientId,
      })
      .where('user.id IN (:...ids)', { ids })
      .getMany();
  }

  findActiveById(id: number): Promise<User | null> {
    return this.users.findOne({
      relations: { image: true },
      where: {
        deletedAt: IsNull(),
        id,
        isActive: true,
        isBlocked: false,
      },
    });
  }

  async saveWithProfile(
    user: User,
    userProfileId: number | null,
    clientId: number,
    profile: Profile,
    manager: EntityManager,
  ): Promise<User> {
    const saved = await manager.save(User, user);

    await manager.save(UserProfile, {
      ...(userProfileId === null ? {} : { id: userProfileId }),
      user: saved,
      client: { id: clientId },
      profile,
    });

    return saved;
  }

  async delete(users: User[]): Promise<number[]> {
    const ids = users.map((user) => user.id);
    await this.users.softRemove(users);
    return ids;
  }

  updatePassword(id: number, passwordHash: string): Promise<void> {
    return this.users.update(id, { passwordHash }).then(() => undefined);
  }

  saveCurrentUserProfile(user: User): Promise<User> {
    return this.users.save(user);
  }
}
