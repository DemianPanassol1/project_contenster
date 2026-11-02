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

import { Client } from '@/modules/core/identity/clients/entities/client.entity';
import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { Functionality } from './functionality.entity';

@Index('idx_funcionalidades_clientes_idiomas_cliente', ['client'])
@Index('idx_funcionalidades_clientes_idiomas_funcionalidade', ['functionality'])
@Index('idx_funcionalidades_clientes_idiomas_idioma', ['language'])
@Unique('uq_funcionalidades_clientes_idiomas', ['client', 'functionality', 'language'])
@Entity({ name: 'funcionalidades_clientes_idiomas' })
export class FunctionalityClientLanguage {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_funcionalidades_clientes_idiomas_cliente',
    name: 'cliente_id',
  })
  declare client: Client;

  @ManyToOne(() => Functionality, (functionality) => functionality.enabledLanguageLinks, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_funcionalidades_clientes_idiomas_funcionalidade',
    name: 'funcionalidade_id',
  })
  declare functionality: Functionality;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_funcionalidades_clientes_idiomas_idioma',
    name: 'idioma_id',
  })
  declare language: Language;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
