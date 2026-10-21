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
  declare id: number;

  @ManyToOne(() => Client, (client) => client.storageConfigurations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_configuracoes_storage_provedor_cliente',
    name: 'cliente_id',
  })
  declare client: Client;

  @Column({
    enum: StorageProvider,
    enumName: 'provedor_storage_configuracao',
    name: 'provedor',
    type: 'enum',
  })
  declare provider: StorageProvider;

  @Column({ length: 100, name: 'nome', type: 'varchar' })
  declare name: string;

  @Column({ length: 150, name: 'identificador', nullable: true, type: 'varchar' })
  declare identifier: string | null;

  @Column({ length: 150, name: 'nome_bucket', nullable: true, type: 'varchar' })
  declare bucketName: string | null;

  @Column({ length: 150, name: 'id_conta', nullable: true, type: 'varchar' })
  declare accountId: string | null;

  @Column({ length: 150, name: 'id_projeto', nullable: true, type: 'varchar' })
  declare projectId: string | null;

  @Column({ length: 255, name: 'endpoint', nullable: true, type: 'varchar' })
  declare endpoint: string | null;

  @Column({ length: 255, name: 'url_publica_base', nullable: true, type: 'varchar' })
  declare publicBaseUrl: string | null;

  @Column({ default: false, name: 'usar_urls_assinadas', type: 'boolean' })
  declare useSignedUrls: boolean;

  @Column({ name: 'tempo_expiracao_url_assinada_segundos', nullable: true, type: 'integer' })
  declare signedUrlExpiresInSeconds: number | null;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => StorageFileTypeRule, (rule) => rule.storageConfiguration)
  declare fileTypeRules: StorageFileTypeRule[];

  @OneToOne(() => StorageProviderCredential, (credential) => credential.storageConfiguration)
  declare credential: StorageProviderCredential | null;

  @OneToMany(() => File, (file) => file.storageConfiguration)
  declare files: File[];
}
