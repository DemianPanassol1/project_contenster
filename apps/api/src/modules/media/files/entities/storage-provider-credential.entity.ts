import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StorageProviderConfiguration } from './storage-provider-configuration.entity';
@Index('uq_credenciais_storage_configuracao_ativo', ['storageConfiguration'], { unique: true })
@Entity({ name: 'credenciais_storage_provedor' })
export class StorageProviderCredential {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @OneToOne(() => StorageProviderConfiguration, (configuration) => configuration.credential, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'configuracao_storage_id' })
  storageConfiguration!: StorageProviderConfiguration;

  @Column({ name: 'access_key_id_criptografado', nullable: true, type: 'text' })
  accessKeyIdEncrypted!: string | null;

  @Column({ name: 'secret_access_key_criptografado', nullable: true, type: 'text' })
  secretAccessKeyEncrypted!: string | null;

  @Column({ name: 'client_email_criptografado', nullable: true, type: 'text' })
  clientEmailEncrypted!: string | null;

  @Column({ name: 'private_key_criptografada', nullable: true, type: 'text' })
  privateKeyEncrypted!: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
