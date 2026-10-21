import type { FileType, PaginateRequest } from '@contenster/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type DeepPartial, In, Repository } from 'typeorm';

import { applyPaginatedQueryBuilder, type QueryFieldMap } from '@/shared/pagination';

import { File } from '../files/entities/file.entity';
import { StorageFileTypeRule } from '../files/entities/storage-file-type-rule.entity';
import { StorageProviderConfiguration } from '../files/entities/storage-provider-configuration.entity';
import { StorageProviderCredential } from '../files/entities/storage-provider-credential.entity';

const CONFIGURATION_FIELDS: QueryFieldMap = {
  id: 'configuration.id',
  isActive: 'configuration.eh_ativo',
  name: 'configuration.nome',
  provider: 'configuration.provedor',
};

const RULE_FIELDS: QueryFieldMap = {
  fileType: 'rule.tipo_arquivo',
  id: 'rule.id',
  isActive: 'rule.eh_ativo',
  storageConfigurationName: 'configuration.nome',
};

const FILE_FIELDS: QueryFieldMap = {
  createdAt: 'file.criado_em',
  fileType: 'file.tipo_arquivo',
  mimeType: 'file.tipo_mime',
  originalName: 'file.nome_original',
  provider: 'file.provedor_storage',
  uploadedByName: 'uploadedBy.nome',
};

@Injectable()
export class ClientStorageRepository {
  constructor(
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(StorageFileTypeRule) private readonly rules: Repository<StorageFileTypeRule>,
    @InjectRepository(StorageProviderConfiguration)
    private readonly configurations: Repository<StorageProviderConfiguration>,
    @InjectRepository(StorageProviderCredential)
    private readonly credentials: Repository<StorageProviderCredential>,
  ) {}

  listConfigurations(
    clientId: number,
    request: PaginateRequest,
  ): Promise<[StorageProviderConfiguration[], number]> {
    const query = this.configurations
      .createQueryBuilder('configuration')
      .leftJoinAndSelect('configuration.credential', 'credential')
      .where('configuration.cliente_id = :clientId', { clientId });

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'name', direction: 'asc' }],
      fields: CONFIGURATION_FIELDS,
      tieBreaker: 'configuration.id',
    });
  }

  listRules(clientId: number, request: PaginateRequest): Promise<[StorageFileTypeRule[], number]> {
    const query = this.rules
      .createQueryBuilder('rule')
      .innerJoinAndSelect('rule.storageConfiguration', 'configuration')
      .where('rule.cliente_id = :clientId', { clientId });

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'fileType', direction: 'asc' }],
      fields: RULE_FIELDS,
      tieBreaker: 'rule.id',
    });
  }

  listFiles(clientId: number, request: PaginateRequest): Promise<[File[], number]> {
    const query = this.files
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.uploadedBy', 'uploadedBy')
      .where('file.cliente_id = :clientId', { clientId });

    return applyPaginatedQueryBuilder(query, request, {
      defaultSort: [{ field: 'createdAt', direction: 'desc' }],
      fields: FILE_FIELDS,
      tieBreaker: 'file.id',
    });
  }

  findConfiguration(clientId: number, id: number): Promise<StorageProviderConfiguration | null> {
    return this.configurations.findOne({
      relations: { credential: true },
      where: { client: { id: clientId }, id },
    });
  }

  findRule(clientId: number, id: number): Promise<StorageFileTypeRule | null> {
    return this.rules.findOne({ where: { client: { id: clientId }, id } });
  }

  findConfigurationsByIds(
    clientId: number,
    ids: number[],
  ): Promise<StorageProviderConfiguration[]> {
    return this.configurations.find({ where: { client: { id: clientId }, id: In(ids) } });
  }

  findRulesByIds(clientId: number, ids: number[]): Promise<StorageFileTypeRule[]> {
    return this.rules.find({ where: { client: { id: clientId }, id: In(ids) } });
  }

  saveConfiguration(
    configuration: DeepPartial<StorageProviderConfiguration>,
    credential: DeepPartial<StorageProviderCredential> | null,
  ): Promise<StorageProviderConfiguration> {
    return this.configurations.manager.transaction(async (manager) => {
      const saved = await manager.save(StorageProviderConfiguration, configuration);

      if (credential !== null) {
        await manager.save(StorageProviderCredential, {
          ...credential,
          storageConfiguration: saved,
        });
      }

      return saved;
    });
  }

  saveRule(rule: DeepPartial<StorageFileTypeRule>): Promise<StorageFileTypeRule> {
    return this.rules.save(rule);
  }

  async deleteConfigurations(configurations: StorageProviderConfiguration[]): Promise<number[]> {
    const ids = configurations.map((configuration) => configuration.id);

    await this.configurations.remove(configurations);

    return ids;
  }

  async deleteRules(rules: StorageFileTypeRule[]): Promise<number[]> {
    const ids = rules.map((rule) => rule.id);

    await this.rules.remove(rules);

    return ids;
  }

  hasActiveRule(
    clientId: number,
    fileType: FileType,
    excludingId: number | null,
  ): Promise<boolean> {
    const query = this.rules
      .createQueryBuilder('rule')
      .where('rule.cliente_id = :clientId', { clientId })
      .andWhere('rule.tipo_arquivo = :fileType', { fileType })
      .andWhere('rule.eh_ativo = true');

    if (excludingId !== null) query.andWhere('rule.id != :excludingId', { excludingId });

    return query.getExists();
  }
}
