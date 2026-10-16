import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { File } from '@/modules/media/files/entities/file.entity';

@Index('uq_idiomas_codigo_idioma_codigo_regiao', ['languageCode', 'regionCode'], { unique: true })
@Check(
  'ck_idiomas_locale_components',
  `"codigo_idioma" ~ '^[a-z]{2}$' AND "codigo_regiao" ~ '^[A-Z]{2}$'`,
)
@Entity({ name: 'idiomas' })
export class Language {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @ManyToOne(() => File, (file) => file.languages, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'icone_id' })
  icon!: File | null;

  @Column({ name: 'nome', type: 'varchar', length: 75 })
  name!: string;

  @Column({ name: 'codigo_idioma', type: 'varchar', length: 2 })
  languageCode!: string;

  @Column({ name: 'codigo_regiao', type: 'varchar', length: 2 })
  regionCode!: string;

  get locale(): string {
    return `${this.languageCode}-${this.regionCode}`;
  }

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
