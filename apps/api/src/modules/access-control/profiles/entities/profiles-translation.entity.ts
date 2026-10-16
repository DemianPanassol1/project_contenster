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

import { Profile } from './profiles.entity';
@Index('idx_perfis_traducoes_idioma', ['language'])
@Unique('uq_perfis_traducoes_perfil_idioma', ['profile', 'language'])
@Entity({ name: 'perfis_traducoes' })
export class ProfileTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => Profile, (profile) => profile.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'perfil_id' })
  profile!: Profile;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idioma_id' })
  language!: Language;

  @Column({ length: 75, name: 'nome', type: 'varchar' })
  name!: string;

  @Column({ length: 255, name: 'descricao', nullable: true, type: 'varchar' })
  description!: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
