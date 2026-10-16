import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DocumentType } from '@contenster/shared';
import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { City } from '@/modules/locations/cities/entities/city.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { StorageFileTypeRule } from '@/modules/media/files/entities/storage-file-type-rule.entity';
import { StorageProviderConfiguration } from '@/modules/media/files/entities/storage-provider-configuration.entity';

import { ClientLanguage } from './client-language.entity';

@Entity({ name: 'clientes' })
export class Client {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => File, (file) => file.clients, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'imagem_id' })
  image!: File | null;

  @Column({ length: 150, name: 'razao_social', type: 'varchar' })
  corporateName!: string;

  @Column({ length: 150, name: 'nome_fantasia', type: 'varchar' })
  tradeName!: string;

  @Index('idx_clientes_documento')
  @Column({ length: 30, name: 'documento', type: 'varchar' })
  document!: string;

  @Column({ enum: DocumentType, enumName: 'tipo_documento', name: 'tipo_documento', type: 'enum' })
  documentType!: DocumentType;

  @Column({ length: 150, name: 'email', type: 'varchar' })
  email!: string;

  @Column({ length: 30, name: 'telefone_principal', type: 'varchar' })
  primaryPhone!: string;

  @Column({ length: 30, name: 'telefone_secundario', nullable: true, type: 'varchar' })
  secondaryPhone!: string | null;

  @Column({ length: 150, name: 'endereco', type: 'varchar' })
  address!: string;

  @Column({ length: 20, name: 'numero_endereco', type: 'varchar' })
  addressNumber!: string;

  @Column({ length: 10, name: 'cep', type: 'varchar' })
  zipCode!: string;

  @Column({ length: 100, name: 'bairro', type: 'varchar' })
  neighborhood!: string;

  @Index('uq_clientes_slug', { unique: true })
  @Column({ length: 75, name: 'slug', type: 'varchar' })
  slug!: string;

  @Index('idx_clientes_cidade')
  @ManyToOne(() => City, (city) => city.clients, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cidade_id' })
  city!: City | null;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deletado_em', nullable: true, type: 'timestamp' })
  deletedAt!: Date | null;

  @OneToMany(() => Profile, (profile) => profile.client)
  profiles!: Profile[];

  @OneToMany(() => Functionality, (functionality) => functionality.client)
  functionalities!: Functionality[];

  @OneToMany(() => File, (file) => file.client)
  files!: File[];

  @OneToMany(() => StorageProviderConfiguration, (configuration) => configuration.client)
  storageConfigurations!: StorageProviderConfiguration[];

  @OneToMany(() => StorageFileTypeRule, (rule) => rule.client)
  storageFileTypeRules!: StorageFileTypeRule[];

  @OneToMany(() => ClientLanguage, (link) => link.client)
  availableLanguageLinks!: ClientLanguage[];
}
