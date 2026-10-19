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

import { Country } from './country.entity';

@Index('idx_paises_traducoes_idioma', ['language'])
@Unique('uq_paises_traducoes_pais_idioma', ['country', 'language'])
@Entity({ name: 'paises_traducoes' })
export class CountryTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Country, (country) => country.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_paises_traducoes_pais', name: 'pais_id' })
  declare country: Country;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_paises_traducoes_idioma', name: 'idioma_id' })
  declare language: Language;

  @Column({ length: 100, name: 'nome', type: 'varchar' })
  declare name: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
