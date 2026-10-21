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
  declare id: number;

  @OneToOne(() => StorageProviderConfiguration, (configuration) => configuration.credential, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_credenciais_storage_provedor_configuracao',
    name: 'configuracao_storage_id',
  })
  declare storageConfiguration: StorageProviderConfiguration;

  @Column({ name: 'access_key_id_criptografado', nullable: true, type: 'text' })
  declare accessKeyIdEncrypted: string | null;

  @Column({ name: 'secret_access_key_criptografado', nullable: true, type: 'text' })
  declare secretAccessKeyEncrypted: string | null;

  @Column({ name: 'client_email_criptografado', nullable: true, type: 'text' })
  declare clientEmailEncrypted: string | null;

  @Column({ name: 'private_key_criptografada', nullable: true, type: 'text' })
  declare privateKeyEncrypted: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
