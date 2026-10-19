import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { Action } from '@/modules/authorization/actions/entities/action.entity';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';
import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';
import {
  buildTranslatedLabelExpression,
  buildTranslationQueryParameters,
} from '@/shared/translations';

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
    @InjectRepository(Functionality) private readonly functionalities: Repository<Functionality>,
    @InjectRepository(Action) private readonly actions: Repository<Action>,
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

  findById(clientId: number, id: number): Promise<Profile | null> {
    return this.profiles.findOne({
      where: { id, clientId },
      relations: {
        translations: { language: true },
        permissions: { functionality: true, action: true },
      },
    });
  }

  findByIds(clientId: number, ids: number[]): Promise<Profile[]> {
    return this.profiles.find({ where: { clientId, id: In(ids) } });
  }

  findLanguagesByCodes(codes: string[]): Promise<Language[]> {
    return this.languages.find({ where: { languageCode: In(codes) } });
  }

  findFunctionalities(clientId: number, ids: number[]): Promise<Functionality[]> {
    return this.functionalities.find({ where: { id: In(ids), client: { id: clientId } } });
  }

  findActions(ids: number[]): Promise<Action[]> {
    return this.actions.findBy({ id: In(ids) });
  }

  async save(
    profile: DeepPartial<Profile> & {
      translations: DeepPartial<ProfileTranslation>[];
      permissions: { functionality: Functionality; action: Action }[];
    },
  ): Promise<Profile> {
    return this.profiles.save(profile);
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
