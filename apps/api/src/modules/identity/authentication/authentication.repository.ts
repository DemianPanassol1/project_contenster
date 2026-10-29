import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, IsNull, Repository } from 'typeorm';

import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { User } from '@/modules/identity/users/entities/user.entity';

@Injectable()
export class AuthenticationRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
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

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.eh_ativo = true')
      .andWhere('user.eh_bloqueado = false')
      .andWhere('user.deletado_em IS NULL')
      .getOne();
  }

  findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      relations: { image: true },
      where: {
        deletedAt: IsNull(),
        id,
        isActive: true,
        isBlocked: false,
      },
    });
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.userRepository.update(userId, { passwordHash });
  }

  findUserClients(userId: number): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userProfiles', 'userProfile')
      .leftJoinAndSelect('userProfile.client', 'client', 'client.deletado_em IS NULL')
      .where('user.id = :userId', { userId })
      .orderBy('client.nome_fantasia', 'ASC')
      .getOneOrFail();
  }

  findClientAdminProfile(clientId: number): Promise<Profile | null> {
    return this.profileRepository.findOne({
      relations: {
        client: { availableLanguageLinks: { language: true } },
        translations: { language: true },
      },
      where: {
        client: { deletedAt: IsNull(), id: clientId, isActive: true },
        isActive: true,
        isAdmin: true,
      },
    });
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
      .leftJoinAndSelect('user.image', 'image')
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
