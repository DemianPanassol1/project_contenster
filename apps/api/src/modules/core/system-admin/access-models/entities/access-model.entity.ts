import type { AccessModelStructure } from '@contenster/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AccessModelTranslation } from './access-model-translation.entity';

@Entity({ name: 'modelos_acesso' })
export class AccessModel {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ name: 'estrutura', type: 'jsonb' })
  declare structure: AccessModelStructure;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => AccessModelTranslation, (translation) => translation.accessModel, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  declare translations: AccessModelTranslation[];
}
