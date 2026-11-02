import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Language } from '@/modules/core/system-admin/languages/entities/language.entity';

import { AccessModel } from './access-model.entity';

@Unique('uq_modelos_acesso_traducoes_modelo_idioma', ['accessModel', 'language'])
@Entity({ name: 'modelos_acesso_traducoes' })
export class AccessModelTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ length: 75, name: 'nome', type: 'varchar' })
  declare name: string;

  @Column({ length: 255, name: 'descricao', nullable: true, type: 'varchar' })
  declare description: string | null;

  @ManyToOne(() => AccessModel, (accessModel) => accessModel.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_modelos_acesso_traducoes_modelo',
    name: 'modelo_acesso_id',
  })
  declare accessModel: AccessModel;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_modelos_acesso_traducoes_idioma', name: 'idioma_id' })
  declare language: Language;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
