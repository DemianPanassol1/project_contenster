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

import { State } from './state.entity';

@Index('idx_estados_traducoes_idioma', ['language'])
@Unique('uq_estados_traducoes_estado_idioma', ['state', 'language'])
@Entity({ name: 'estados_traducoes' })
export class StateTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => State, (state) => state.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_estados_traducoes_estado', name: 'estado_id' })
  declare state: State;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_estados_traducoes_idioma', name: 'idioma_id' })
  declare language: Language;

  @Column({ length: 100, name: 'nome', type: 'varchar' })
  declare name: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
