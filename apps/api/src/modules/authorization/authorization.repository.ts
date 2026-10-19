import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { ProfilePermission } from './profile-permissions/entities/profile-permission.entity';

@Injectable()
export class AuthorizationRepository {
  constructor(
    @InjectRepository(ProfilePermission)
    private readonly profilePermissionRepository: Repository<ProfilePermission>,
  ) {}

  findActivePermissions(profileId: number, clientId: number): Promise<ProfilePermission[]> {
    return this.profilePermissionRepository
      .createQueryBuilder('permission')
      .innerJoinAndSelect('permission.action', 'action')
      .innerJoinAndSelect('action.translations', 'actionTranslation')
      .innerJoinAndSelect('actionTranslation.language', 'actionLanguage')
      .innerJoinAndSelect('permission.functionality', 'functionality')
      .innerJoinAndSelect('functionality.translations', 'functionalityTranslation')
      .innerJoinAndSelect('functionalityTranslation.language', 'functionalityLanguage')
      .leftJoinAndSelect('functionality.parent', 'parent')
      .leftJoinAndSelect('parent.translations', 'parentTranslation')
      .leftJoinAndSelect('parentTranslation.language', 'parentTranslationLanguage')
      .innerJoinAndSelect('functionality.module', 'module')
      .innerJoinAndSelect('module.translations', 'moduleTranslation')
      .innerJoinAndSelect('moduleTranslation.language', 'moduleTranslationLanguage')
      .where('permission.perfil_id = :profileId', { profileId })
      .andWhere('functionality.eh_ativo = true')
      .andWhere('module.eh_ativo = true')
      .andWhere(
        new Brackets((query) => {
          query
            .where('functionality.cliente_id IS NULL')
            .orWhere('functionality.cliente_id = :clientId', { clientId });
        }),
      )
      .getMany();
  }
}
