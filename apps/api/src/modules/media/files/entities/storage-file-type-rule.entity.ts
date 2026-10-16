import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FileType } from '@contenster/shared';
import { Client } from '@/modules/identity/clients/entities/client.entity';

import { StorageProviderConfiguration } from './storage-provider-configuration.entity';
@Index('idx_regras_storage_tipo_cliente', ['client'])
@Index('idx_regras_storage_tipo_configuracao', ['storageConfiguration'])
@Index('uq_regras_storage_tipo_arquivo_ativo', ['client', 'fileType'], {
  unique: true,
  where: '"eh_ativo" = true',
})
@Entity({ name: 'regras_storage_tipo_arquivo' })
export class StorageFileTypeRule {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => Client, (client) => client.storageFileTypeRules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client;

  @Column({ enum: FileType, enumName: 'tipo_arquivo', name: 'tipo_arquivo', type: 'enum' })
  fileType!: FileType;

  @ManyToOne(() => StorageProviderConfiguration, (configuration) => configuration.fileTypeRules, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'configuracao_storage_id' })
  storageConfiguration!: StorageProviderConfiguration;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
