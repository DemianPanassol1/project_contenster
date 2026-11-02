import type { PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, EntityManager, In, Repository } from 'typeorm';

import { Functionality } from '@/modules/core/access-control/functionalities/entities/functionality.entity';
import { SystemModule } from '@/modules/core/access-control/modules/entities/system-module.entity';
import { ProfilePermission } from '@/modules/core/access-control/profiles/entities/profile-permission.entity';
import { Profile } from '@/modules/core/access-control/profiles/entities/profiles.entity';
import { ClientLanguage } from '@/modules/core/identity/clients/entities/client-language.entity';
import { Action } from '@/modules/core/system-admin/actions/entities/action.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';
import { applyPaginatedQueryBuilder } from '@/shared/pagination';

import { AccessModel } from './entities/access-model.entity';

@Injectable()
export class AccessModelsRepository {
  constructor(
    @InjectRepository(AccessModel) private readonly models: Repository<AccessModel>,
    @InjectRepository(Language) private readonly languages: Repository<Language>,
  ) {}

  list(request: PaginateRequest) {
    return applyPaginatedQueryBuilder(
      this.models
        .createQueryBuilder('accessModel')
        .leftJoinAndSelect('accessModel.translations', 'translations')
        .leftJoinAndSelect('translations.language', 'language'),
      request,
      {
        defaultSort: [{ field: 'id', direction: 'asc' }],
        fields: { id: 'accessModel.id', isActive: 'accessModel.eh_ativo' },
        tieBreaker: 'accessModel.id',
      },
    );
  }

  findById(id: number, manager?: EntityManager): Promise<AccessModel | null> {
    return (manager?.getRepository(AccessModel) ?? this.models).findOne({
      where: { id },
      relations: { translations: { language: true } },
    });
  }

  findByIds(ids: number[]): Promise<AccessModel[]> {
    return this.models.find({ where: { id: In(ids) } });
  }

  findLanguagesByCodes(codes: string[], manager?: EntityManager): Promise<Language[]> {
    return (manager?.getRepository(Language) ?? this.languages).find({
      where: { languageCode: In(codes) },
    });
  }

  save(data: DeepPartial<AccessModel>, manager: EntityManager): Promise<AccessModel> {
    return manager.getRepository(AccessModel).save(data);
  }

  async delete(models: AccessModel[]): Promise<number[]> {
    const ids = models.map((model) => model.id);

    await this.models.remove(models);

    return ids;
  }

  async loadClientState(manager: EntityManager, clientId: number) {
    const [modules, functionalities, languages, profiles, actions] = await Promise.all([
      manager.getRepository(SystemModule).find({
        where: { client: { id: clientId } },
        relations: { translations: { language: true } },
      }),
      manager.getRepository(Functionality).find({
        where: { client: { id: clientId } },
        relations: {
          module: true,
          parent: true,
          translations: { language: true },
          enabledLanguageLinks: { language: true },
        },
      }),
      manager
        .getRepository(ClientLanguage)
        .find({ where: { client: { id: clientId } }, relations: { language: true } }),
      manager.getRepository(Profile).find({
        where: { client: { id: clientId } },
        relations: { permissions: { functionality: true, action: true } },
      }),
      manager.getRepository(Action).find(),
    ]);

    return { modules, functionalities, languages, profiles, actions };
  }

  saveModule(data: DeepPartial<SystemModule>, manager: EntityManager) {
    return manager.getRepository(SystemModule).save(data);
  }

  saveFunctionality(data: DeepPartial<Functionality>, manager: EntityManager) {
    return manager.getRepository(Functionality).save(data);
  }

  removeModules(models: SystemModule[], manager: EntityManager) {
    return manager.getRepository(SystemModule).remove(models);
  }

  removeFunctionalities(functionalities: Functionality[], manager: EntityManager) {
    return manager.getRepository(Functionality).remove(functionalities);
  }

  findActions(manager: EntityManager) {
    return manager.getRepository(Action).find();
  }

  savePermissions(data: DeepPartial<ProfilePermission>[], manager: EntityManager) {
    return manager.getRepository(ProfilePermission).save(data);
  }

  findPermissions(profileId: number, manager: EntityManager) {
    return manager.getRepository(ProfilePermission).find({
      where: { profile: { id: profileId } },
      relations: { functionality: true, action: true },
    });
  }

  async lockSynchronization(manager: EntityManager): Promise<void> {
    // The existing CRUD writers do not take an application lock. PostgreSQL table
    // locks also serialize their writes until this aggregate transaction commits.
    await manager.query(
      'LOCK TABLE modelos_acesso, modelos_acesso_traducoes, clientes, clientes_idiomas, idiomas, modulos, modulos_traducoes, funcionalidades, funcionalidades_traducoes, funcionalidades_clientes_idiomas, perfis, perfis_permissoes, acoes IN SHARE ROW EXCLUSIVE MODE',
    );
  }
}
