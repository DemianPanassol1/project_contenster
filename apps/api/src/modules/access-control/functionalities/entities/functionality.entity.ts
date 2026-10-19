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

import { ProfilePermission } from '@/modules/access-control/profiles/entities/profile-permission.entity';
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
  declare id: number;

  @ManyToOne(() => Client, (client) => client.functionalities, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'cliente_id' })
  declare client: Client;

  @ManyToOne(() => SystemModule, (module) => module.functionalities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'modulo_id' })
  declare module: SystemModule;

  @ManyToOne(() => Functionality, (functionality) => functionality.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funcionalidade_pai_id' })
  declare parent: Functionality | null;

  @OneToMany(() => Functionality, (functionality) => functionality.parent)
  declare children: Functionality[];

  @Column({ length: 75, name: 'slug', type: 'varchar' })
  declare slug: string;

  @Column({ length: 100, name: 'icone', nullable: true, type: 'varchar' })
  declare icon: string | null;

  @Column({ default: 0, name: 'ordem', type: 'integer' })
  declare order: number;

  @Column({ default: false, name: 'eh_agrupador_navegacao', type: 'boolean' })
  declare isNavigationGroup: boolean;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => FunctionalityTranslation, (translation) => translation.functionality, {
    cascade: true,
  })
  declare translations: FunctionalityTranslation[];

  @OneToMany(() => FunctionalityClientLanguage, (link) => link.functionality, { cascade: true })
  declare enabledLanguageLinks: FunctionalityClientLanguage[];

  @OneToMany(() => ProfilePermission, (permission) => permission.functionality)
  declare profilePermissions: ProfilePermission[];
}
