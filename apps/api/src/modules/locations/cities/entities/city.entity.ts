import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Client } from '@/modules/identity/clients/entities/client.entity';
import { State } from '@/modules/locations/states/entities/state.entity';

import { CityTranslation } from './city-translation.entity';

@Index('idx_cidades_estado', ['state'])
@Index('uq_cidades_codigo_ibge', ['ibgeCode'], {
  unique: true,
  where: '"codigo_ibge" IS NOT NULL',
})
@Entity({ name: 'cidades' })
export class City {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => State, (state) => state.cities, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'estado_id' })
  declare state: State;

  @Column({ length: 20, name: 'codigo_ibge', nullable: true, type: 'varchar' })
  declare ibgeCode: string | null;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => CityTranslation, (translation) => translation.city, { cascade: true })
  declare translations: CityTranslation[];

  @OneToMany(() => Client, (client) => client.city)
  declare clients: Client[];
}
