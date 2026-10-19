import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';
import { Action } from '@/modules/authorization/actions/entities/action.entity';

import { Profile } from './profiles.entity';

@Index('idx_perfis_permissoes_perfil', ['profile'])
@Index('idx_perfis_permissoes_funcionalidade', ['functionality'])
@Index('idx_perfis_permissoes_acao', ['action'])
@Unique('uq_perfis_permissoes_perfil_funcionalidade_acao', ['profile', 'functionality', 'action'])
@Entity({ name: 'perfis_permissoes' })
export class ProfilePermission {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Profile, (profile) => profile.permissions, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'perfil_id' })
  declare profile: Profile;

  @ManyToOne(() => Functionality, (functionality) => functionality.profilePermissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funcionalidade_id' })
  declare functionality: Functionality;

  @ManyToOne(() => Action, (action) => action.profilePermissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'acao_id' })
  declare action: Action;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
