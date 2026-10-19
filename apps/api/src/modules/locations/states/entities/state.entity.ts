import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { City } from '@/modules/locations/cities/entities/city.entity';
import { Country } from '@/modules/locations/countries/entities/country.entity';

import { StateTranslation } from './state-translation.entity';

@Index('idx_estados_pais', ['country'])
@Unique('uq_estados_pais_codigo', ['country', 'code'])
@Entity({ name: 'estados' })
export class State {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Country, (country) => country.states, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_estados_pais', name: 'pais_id' })
  declare country: Country;

  @Column({ length: 20, name: 'codigo', type: 'varchar' })
  declare code: string;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => StateTranslation, (translation) => translation.state, { cascade: true })
  declare translations: StateTranslation[];

  @OneToMany(() => City, (city) => city.state)
  declare cities: City[];
}
