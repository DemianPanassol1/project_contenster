import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, type EntityManager, In, Repository } from 'typeorm';

import { UserProfile } from '@/modules/core/identity/users/entities/user-profile.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

import { ProfilePermission } from './entities/profile-permission.entity';
import { Profile } from './entities/profiles.entity';
import { ProfileTranslation } from './entities/profiles-translation.entity';

const nameExpression = buildTranslatedLabelExpression({
  fieldColumn: 'nome',
  ownerColumn: 'perfil_id',
  ownerExpression: 'profile.id',
  table: 'perfis_traducoes',
  uniqueAlias: 'profile_name',
});
const LIST_FIELDS: QueryFieldMap = {
  id: 'profile.id',
  isActive: 'profile.eh_ativo',
  name: nameExpression,
};

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
    @InjectRepository(UserProfile) private readonly userProfiles: Repository<UserProfile>,
  ) {}

  list(clientId: number, request: PaginateRequest, locale: string): Promise<[Profile[], number]> {
    const query = this.profiles
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'translationLanguage')
      .where('profile.cliente_id = :clientId', { clientId })
      .setParameters(buildTranslationQueryParameters(locale));

    return applyPaginatedQueryBuilder<Profile>(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: LIST_FIELDS,
      tieBreaker: 'profile.id',
    });
  }

  findById(clientId: number, id: number, manager?: EntityManager): Promise<Profile | null> {
    return (manager?.getRepository(Profile) ?? this.profiles).findOne({
      where: { id, client: { id: clientId } },
      relations: {
        translations: { language: true },
        permissions: { functionality: true, action: true },
      },
    });
  }

  findByIds(clientId: number, ids: number[]): Promise<Profile[]> {
    return this.profiles.find({ where: { client: { id: clientId }, id: In(ids) } });
  }

  findLanguagesByCodes(codes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(codes) } });
  }

  findActiveAdminByClientId(clientId: number, manager: EntityManager): Promise<Profile[]> {
    return manager.getRepository(Profile).find({
      where: { client: { id: clientId }, isActive: true, isAdmin: true },
      relations: { translations: { language: true } },
    });
  }

  findLanguagesByCodesInTransaction(codes: string[], manager: EntityManager): Promise<Language[]> {
    return manager.getRepository(Language).find({ where: { languageCode: In(codes) } });
  }

  async save(
    profile: DeepPartial<Profile> & {
      translations: DeepPartial<ProfileTranslation>[];
      permissions: DeepPartial<ProfilePermission>[];
    },
  ): Promise<Profile> {
    return this.profiles.save(profile);
  }

  saveInTransaction(data: DeepPartial<Profile>, manager: EntityManager): Promise<Profile> {
    return manager.getRepository(Profile).save(data);
  }

  hasUsers(ids: number[]): Promise<boolean> {
    return this.userProfiles.exists({ where: { profile: { id: In(ids) } } });
  }

  async delete(profiles: Profile[]): Promise<number[]> {
    const ids = profiles.map((profile) => profile.id);
    await this.profiles.remove(profiles);
    return ids;
  }
}
