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

import { Functionality } from './functionality.entity';
@Index('idx_funcionalidades_traducoes_idioma', ['language'])
@Unique('uq_funcionalidades_traducoes_funcionalidade_idioma', ['functionality', 'language'])
@Entity({ name: 'funcionalidades_traducoes' })
export class FunctionalityTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Functionality, (functionality) => functionality.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_funcionalidades_traducoes_funcionalidade',
    name: 'funcionalidade_id',
  })
  declare functionality: Functionality;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_funcionalidades_traducoes_idioma',
    name: 'idioma_id',
  })
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
