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

import { City } from './city.entity';

@Index('idx_cidades_traducoes_idioma', ['language'])
@Unique('uq_cidades_traducoes_cidade_idioma', ['city', 'language'])
@Entity({ name: 'cidades_traducoes' })
export class CityTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => City, (city) => city.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_cidades_traducoes_cidade', name: 'cidade_id' })
  declare city: City;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_cidades_traducoes_idioma', name: 'idioma_id' })
  declare language: Language;

  @Column({ length: 100, name: 'nome', type: 'varchar' })
  declare name: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
