import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StorageProvider } from '@contenster/shared';
import { Client } from '@/modules/identity/clients/entities/client.entity';

import { File } from './file.entity';
import { StorageFileTypeRule } from './storage-file-type-rule.entity';
import { StorageProviderCredential } from './storage-provider-credential.entity';
@Index('idx_configuracoes_storage_provedor_cliente', ['client'])
@Entity({ name: 'configuracoes_storage_provedor' })
export class StorageProviderConfiguration {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => Client, (client) => client.storageConfigurations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client;

  @Column({
    enum: StorageProvider,
    enumName: 'provedor_storage_configuracao',
    name: 'provedor',
    type: 'enum',
  })
  provider!: StorageProvider;

  @Column({ length: 100, name: 'nome', type: 'varchar' })
  name!: string;

  @Column({ length: 150, name: 'identificador', nullable: true, type: 'varchar' })
  identifier!: string | null;

  @Column({ length: 150, name: 'nome_bucket', nullable: true, type: 'varchar' })
  bucketName!: string | null;

  @Column({ length: 150, name: 'id_conta', nullable: true, type: 'varchar' })
  accountId!: string | null;

  @Column({ length: 150, name: 'id_projeto', nullable: true, type: 'varchar' })
  projectId!: string | null;

  @Column({ length: 255, name: 'endpoint', nullable: true, type: 'varchar' })
  endpoint!: string | null;

  @Column({ length: 255, name: 'url_publica_base', nullable: true, type: 'varchar' })
  publicBaseUrl!: string | null;

  @Column({ default: false, name: 'usar_urls_assinadas', type: 'boolean' })
  useSignedUrls!: boolean;

  @Column({ name: 'tempo_expiracao_url_assinada_segundos', nullable: true, type: 'integer' })
  signedUrlExpiresInSeconds!: number | null;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => StorageFileTypeRule, (rule) => rule.storageConfiguration)
  fileTypeRules!: StorageFileTypeRule[];

  @OneToOne(() => StorageProviderCredential, (credential) => credential.storageConfiguration)
  credential!: StorageProviderCredential | null;

  @OneToMany(() => File, (file) => file.storageConfiguration)
  files!: File[];
}
