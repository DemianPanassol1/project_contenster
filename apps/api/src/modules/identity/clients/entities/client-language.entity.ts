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

import { Client } from './client.entity';

@Index('idx_clientes_idiomas_cliente', ['client'])
@Index('idx_clientes_idiomas_idioma', ['language'])
@Unique('uq_clientes_idiomas_cliente_idioma', ['client', 'language'])
@Entity({ name: 'clientes_idiomas' })
export class ClientLanguage {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Client, (client) => client.availableLanguageLinks, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'cliente_id' })
  declare client: Client;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idioma_id' })
  declare language: Language;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
