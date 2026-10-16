import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { State } from '@/modules/locations/states/entities/state.entity';

import { CountryTranslation } from './country-translation.entity';

@Index('uq_paises_iso2', ['iso2'], { unique: true })
@Index('uq_paises_iso3', ['iso3'], { unique: true, where: '"iso3" IS NOT NULL' })
@Entity({ name: 'paises' })
export class Country {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ length: 2, name: 'iso2', type: 'varchar' })
  declare iso2: string;

  @Column({ length: 3, name: 'iso3', nullable: true, type: 'varchar' })
  declare iso3: string | null;

  @Column({ length: 10, name: 'codigo_telefone', nullable: true, type: 'varchar' })
  declare phoneCode: string | null;

  @Column({ length: 3, name: 'codigo_moeda', nullable: true, type: 'varchar' })
  declare currencyCode: string | null;

  @Column({ length: 10, name: 'locale', nullable: true, type: 'varchar' })
  declare locale: string | null;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => CountryTranslation, (translation) => translation.country, { cascade: true })
  declare translations: CountryTranslation[];

  @OneToMany(() => State, (state) => state.country)
  declare states: State[];
}
