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
  declare id: number;

  @Column({ enum: FileType, enumName: 'tipo_arquivo', name: 'tipo_arquivo', type: 'enum' })
  declare fileType: FileType;

  @Column({ length: 150, name: 'nome_original', type: 'varchar' })
  declare originalName: string;

  @Column({ length: 150, name: 'nome_armazenado', type: 'varchar' })
  declare storedName: string;

  @Column({ length: 255, name: 'caminho_arquivo', type: 'varchar' })
  declare filePath: string;

  @Column({ length: 255, name: 'chave_storage', type: 'varchar' })
  declare storageKey: string;

  @Column({
    enum: StorageProvider,
    enumName: 'provedor_storage_arquivo',
    name: 'provedor_storage',
    type: 'enum',
  })
  declare storageProvider: StorageProvider;

  @Column({ length: 500, name: 'url_publica', nullable: true, type: 'varchar' })
  declare publicUrl: string | null;

  @Column({ length: 100, name: 'tipo_mime', type: 'varchar' })
  declare mimeType: string;

  @Column({ length: 20, name: 'extensao', nullable: true, type: 'varchar' })
  declare extension: string | null;

  @Column({ name: 'tamanho_bytes', type: 'integer' })
  declare sizeInBytes: number;

  @Column({ name: 'largura', nullable: true, type: 'integer' })
  declare width: number | null;

  @Column({ name: 'altura', nullable: true, type: 'integer' })
  declare height: number | null;

  @ManyToOne(() => Client, (client) => client.files, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_arquivos_cliente', name: 'cliente_id' })
  declare client: Client;

  @ManyToOne(() => User, (user) => user.uploadedFiles, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_arquivos_usuario_upload', name: 'usuario_upload_id' })
  declare uploadedBy: User | null;

  @ManyToOne(() => StorageProviderConfiguration, (configuration) => configuration.files, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_arquivos_configuracao_storage',
    name: 'configuracao_storage_id',
  })
  declare storageConfiguration: StorageProviderConfiguration | null;

  @OneToMany(() => Language, (language) => language.icon)
  declare languages: Language[];

  @OneToMany(() => Client, (client) => client.image)
  declare clients: Client[];

  @OneToMany(() => User, (user) => user.image)
  declare users: User[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
