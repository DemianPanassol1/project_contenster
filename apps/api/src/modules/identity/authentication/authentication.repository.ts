import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { User } from '@/modules/identity/users/entities/user.entity';

@Injectable()
export class AuthenticationRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findUserByUsernameOrEmail(identifier: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where(
        new Brackets((query) =>
          query
            .where('user.nome_usuario = :identifier', { identifier })
            .orWhere('user.email = :identifier', { identifier }),
        ),
      )
      .andWhere('user.eh_ativo = true')
      .andWhere('user.eh_bloqueado = false')
      .andWhere('user.deletado_em IS NULL')
      .getOne();
  }

  findUserClients(userId: number): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userProfiles', 'userProfile')
      .innerJoinAndSelect('userProfile.client', 'client')
      .where('user.id = :userId', { userId })
      .andWhere('client.eh_ativo = true')
      .andWhere('client.deletado_em IS NULL')
      .orderBy('client.nome_fantasia', 'ASC')
      .getOneOrFail();
  }

  findUserContext(userId: number, clientId: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'user.userProfiles',
        'userProfile',
        'userProfile.cliente_id = :clientId',
        { clientId },
      )
      .innerJoinAndSelect('userProfile.client', 'client')
      .leftJoinAndSelect('client.availableLanguageLinks', 'clientLanguage')
      .leftJoinAndSelect('clientLanguage.language', 'language')
      .innerJoinAndSelect('userProfile.profile', 'profile')
      .leftJoinAndSelect('profile.translations', 'profileTranslation')
      .leftJoinAndSelect('profileTranslation.language', 'profileLanguage')
      .where('user.id = :userId', { userId })
      .andWhere('user.eh_ativo = true')
      .andWhere('user.eh_bloqueado = false')
      .andWhere('user.deletado_em IS NULL')
      .andWhere('client.eh_ativo = true')
      .andWhere('client.deletado_em IS NULL')
      .andWhere('profile.eh_ativo = true')
      .getOne();
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, { lastLoginAt: new Date() });
  }
}
