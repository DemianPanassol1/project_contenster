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

import { ProfilePermission } from '@/modules/authorization/profile-permissions/entities/profile-permission.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';

import { SystemModule } from '../../modules/entities/system-module.entity';

import { FunctionalityClientLanguage } from './functionality-client-language.entity';
import { FunctionalityTranslation } from './functionality-translation.entity';

@Index('idx_funcionalidades_cliente', ['client'])
@Index('idx_funcionalidades_modulo', ['module'])
@Index('idx_funcionalidades_pai', ['parent'])
@Entity({ name: 'funcionalidades' })
export class Functionality {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => Client, (client) => client.functionalities, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client | null;

  @ManyToOne(() => SystemModule, (module) => module.functionalities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'modulo_id' })
  module!: SystemModule;

  @ManyToOne(() => Functionality, (functionality) => functionality.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funcionalidade_pai_id' })
  parent!: Functionality | null;

  @OneToMany(() => Functionality, (functionality) => functionality.parent)
  children!: Functionality[];

  @Column({ length: 75, name: 'slug', type: 'varchar' })
  slug!: string;

  @Column({ length: 100, name: 'icone', nullable: true, type: 'varchar' })
  icon!: string | null;

  @Column({ default: 0, name: 'ordem', type: 'integer' })
  order!: number;

  @Column({ default: false, name: 'eh_agrupador_navegacao', type: 'boolean' })
  isNavigationGroup!: boolean;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => FunctionalityTranslation, (translation) => translation.functionality, {
    cascade: true,
  })
  translations!: FunctionalityTranslation[];

  @OneToMany(() => FunctionalityClientLanguage, (link) => link.functionality)
  enabledLanguageLinks!: FunctionalityClientLanguage[];

  @OneToMany(() => ProfilePermission, (permission) => permission.functionality)
  profilePermissions!: ProfilePermission[];
}
