import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FileType, StorageProvider } from '@contenster/shared';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';

import { StorageProviderConfiguration } from './storage-provider-configuration.entity';

@Index('idx_arquivos_cliente', ['client'])
@Index('idx_arquivos_configuracao_storage', ['storageConfiguration'])
@Index('idx_arquivos_usuario_upload', ['uploadedBy'])
@Index('idx_arquivos_criado_em', ['createdAt'])
@Entity({ name: 'arquivos' })
export class File {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @Column({ enum: FileType, enumName: 'tipo_arquivo', name: 'tipo_arquivo', type: 'enum' })
  fileType!: FileType;

  @Column({ length: 150, name: 'nome_original', type: 'varchar' })
  originalName!: string;

  @Column({ length: 150, name: 'nome_armazenado', type: 'varchar' })
  storedName!: string;

  @Column({ length: 255, name: 'caminho_arquivo', type: 'varchar' })
  filePath!: string;

  @Column({ length: 255, name: 'chave_storage', type: 'varchar' })
  storageKey!: string;

  @Column({
    enum: StorageProvider,
    enumName: 'provedor_storage_arquivo',
    name: 'provedor_storage',
    type: 'enum',
  })
  storageProvider!: StorageProvider;

  @Column({ length: 500, name: 'url_publica', nullable: true, type: 'varchar' })
  publicUrl!: string | null;

  @Column({ length: 100, name: 'tipo_mime', type: 'varchar' })
  mimeType!: string;

  @Column({ length: 20, name: 'extensao', nullable: true, type: 'varchar' })
  extension!: string | null;

  @Column({ name: 'tamanho_bytes', type: 'integer' })
  sizeInBytes!: number;

  @Column({ name: 'largura', nullable: true, type: 'integer' })
  width!: number | null;

  @Column({ name: 'altura', nullable: true, type: 'integer' })
  height!: number | null;

  @ManyToOne(() => Client, (client) => client.files, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client;

  @ManyToOne(() => User, (user) => user.uploadedFiles, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_upload_id' })
  uploadedBy!: User | null;

  @ManyToOne(() => StorageProviderConfiguration, (configuration) => configuration.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'configuracao_storage_id' })
  storageConfiguration!: StorageProviderConfiguration | null;

  @OneToMany(() => Language, (language) => language.icon)
  languages!: Language[];

  @OneToMany(() => Client, (client) => client.image)
  clients!: Client[];

  @OneToMany(() => User, (user) => user.image)
  users!: User[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
