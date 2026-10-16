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
  id!: number;

  @Column({ default: 0, name: 'ordem', type: 'integer' })
  order!: number;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => SystemModuleTranslation, (translation) => translation.module, { cascade: true })
  translations!: SystemModuleTranslation[];

  @OneToMany(() => Functionality, (functionality) => functionality.module)
  functionalities!: Functionality[];
}
