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

import { Language } from '@/modules/communication/languages/entities/language.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';

import { Functionality } from './functionality.entity';

@Index('idx_funcionalidades_clientes_idiomas_cliente', ['client'])
@Index('idx_funcionalidades_clientes_idiomas_funcionalidade', ['functionality'])
@Index('idx_funcionalidades_clientes_idiomas_idioma', ['language'])
@Unique('uq_funcionalidades_clientes_idiomas', ['client', 'functionality', 'language'])
@Entity({ name: 'funcionalidades_clientes_idiomas' })
export class FunctionalityClientLanguage {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client;

  @ManyToOne(() => Functionality, (functionality) => functionality.enabledLanguageLinks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funcionalidade_id' })
  functionality!: Functionality;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idioma_id' })
  language!: Language;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
