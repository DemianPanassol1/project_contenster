import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ActionType } from '@contenster/shared';
import { ProfilePermission } from '@/modules/authorization/profile-permissions/entities/profile-permission.entity';

import { ActionTranslation } from './action-translation.entity';
@Entity({ name: 'acoes' })
export class Action {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Index('uq_acoes_tipo', { unique: true })
  @Column({ enum: ActionType, enumName: 'tipo_acao', name: 'tipo', type: 'enum' })
  declare type: ActionType;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => ActionTranslation, (translation) => translation.action)
  declare translations: ActionTranslation[];

  @OneToMany(() => ProfilePermission, (permission) => permission.action)
  declare profilePermissions: ProfilePermission[];
}
