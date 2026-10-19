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
  declare id: number;

  @ManyToOne(() => File, (file) => file.clients, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'imagem_id' })
  declare image: File | null;

  @Column({ length: 150, name: 'razao_social', type: 'varchar' })
  declare corporateName: string;

  @Column({ length: 150, name: 'nome_fantasia', type: 'varchar' })
  declare tradeName: string;

  @Index('idx_clientes_documento')
  @Column({ length: 30, name: 'documento', type: 'varchar' })
  declare document: string;

  @Column({ enum: DocumentType, enumName: 'tipo_documento', name: 'tipo_documento', type: 'enum' })
  declare documentType: DocumentType;

  @Column({ length: 150, name: 'email', type: 'varchar' })
  declare email: string;

  @Column({ length: 30, name: 'telefone_principal', type: 'varchar' })
  declare primaryPhone: string;

  @Column({ length: 30, name: 'telefone_secundario', nullable: true, type: 'varchar' })
  declare secondaryPhone: string | null;

  @Column({ length: 150, name: 'endereco', type: 'varchar' })
  declare address: string;

  @Column({ length: 20, name: 'numero_endereco', type: 'varchar' })
  declare addressNumber: string;

  @Column({ length: 10, name: 'cep', type: 'varchar' })
  declare zipCode: string;

  @Column({ length: 100, name: 'bairro', type: 'varchar' })
  declare neighborhood: string;

  @Index('uq_clientes_slug', { unique: true })
  @Column({ length: 75, name: 'slug', type: 'varchar' })
  declare slug: string;

  @Index('idx_clientes_cidade')
  @ManyToOne(() => City, (city) => city.clients, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_clientes_cidade', name: 'cidade_id' })
  declare city: City | null;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @DeleteDateColumn({ name: 'deletado_em', nullable: true, type: 'timestamp' })
  declare deletedAt: Date | null;

  @OneToMany(() => Profile, (profile) => profile.client)
  declare profiles: Profile[];

  @OneToMany(() => Functionality, (functionality) => functionality.client)
  declare functionalities: Functionality[];

  @OneToMany(() => File, (file) => file.client)
  declare files: File[];

  @OneToMany(() => StorageProviderConfiguration, (configuration) => configuration.client)
  declare storageConfigurations: StorageProviderConfiguration[];

  @OneToMany(() => StorageFileTypeRule, (rule) => rule.client)
  declare storageFileTypeRules: StorageFileTypeRule[];

  @OneToMany(() => ClientLanguage, (link) => link.client, { cascade: true })
  declare availableLanguageLinks: ClientLanguage[];
}
