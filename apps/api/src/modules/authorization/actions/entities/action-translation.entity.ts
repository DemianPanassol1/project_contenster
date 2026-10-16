import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';

import { Action } from './action.entity';
@Index('idx_acoes_traducoes_idioma', ['language'])
@Unique('uq_acoes_traducoes_acao_idioma', ['action', 'language'])
@Entity({ name: 'acoes_traducoes' })
export class ActionTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Action, (action) => action.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'acao_id' })
  declare action: Action;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idioma_id' })
  declare language: Language;

  @Column({ length: 75, name: 'nome', type: 'varchar' })
  declare name: string;

  @Column({ length: 255, name: 'descricao', nullable: true, type: 'varchar' })
  declare description: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
