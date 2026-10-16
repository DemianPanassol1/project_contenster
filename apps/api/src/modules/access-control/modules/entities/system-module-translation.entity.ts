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

import { SystemModule } from './system-module.entity';

@Index('idx_modulos_traducoes_idioma', ['language'])
@Unique('uq_modulos_traducoes_modulo_idioma', ['module', 'language'])
@Entity({ name: 'modulos_traducoes' })
export class SystemModuleTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => SystemModule, (module) => module.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'modulo_id' })
  declare module: SystemModule;

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
