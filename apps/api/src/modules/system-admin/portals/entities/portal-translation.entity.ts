import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Language } from '@/modules/communication/languages/entities/language.entity';

import { Portal } from './portal.entity';

@Index('uq_portais_traducoes_portal_idioma', ['portal', 'language'], { unique: true })
@Entity({ name: 'portais_traducoes' })
export class PortalTranslation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Portal, (portal) => portal.translations, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_portais_traducoes_portal', name: 'portal_id' })
  declare portal: Portal;

  @ManyToOne(() => Language, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_portais_traducoes_idioma', name: 'idioma_id' })
  declare language: Language;

  @Column({ length: 150, name: 'nome_aplicacao', nullable: true, type: 'varchar' })
  declare applicationName: string | null;

  @Column({ length: 500, name: 'descricao_aplicacao', nullable: true, type: 'varchar' })
  declare applicationDescription: string | null;

  @Column({ length: 150, name: 'titulo_login', nullable: true, type: 'varchar' })
  declare loginTitle: string | null;

  @Column({ length: 500, name: 'descricao_login', nullable: true, type: 'varchar' })
  declare loginDescription: string | null;

  @Column({ length: 250, name: 'alt_brand_asset_login', nullable: true, type: 'varchar' })
  declare loginBrandAssetAlt: string | null;

  @Column({ length: 250, name: 'texto_suporte', nullable: true, type: 'varchar' })
  declare supportText: string | null;
}
