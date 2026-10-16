import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Functionality } from '@/modules/access-control/functionalities/entities/functionality.entity';

import { SystemModuleTranslation } from './system-module-translation.entity';

@Entity({ name: 'modulos' })
export class SystemModule {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ default: 0, name: 'ordem', type: 'integer' })
  declare order: number;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => SystemModuleTranslation, (translation) => translation.module, { cascade: true })
  declare translations: SystemModuleTranslation[];

  @OneToMany(() => Functionality, (functionality) => functionality.module)
  declare functionalities: Functionality[];
}
