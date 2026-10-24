import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalSplitMediaPosition,
} from '@contenster/shared';
import { File } from '@/modules/media/files/entities/file.entity';

import { PortalDomain } from './portal-domain.entity';
import { PortalLoginMedia } from './portal-login-media.entity';
import { PortalTranslation } from './portal-translation.entity';

@Check('ck_portais_nome_interno', `nullif(btrim("nome_interno"), '') IS NOT NULL`)
@Check(
  'ck_portais_header_login',
  `("modo_header_login" = 'text' AND "brand_asset_arquivo_id" IS NULL)
    OR ("modo_header_login" = 'brand_asset' AND "icone_header_arquivo_id" IS NULL AND "brand_asset_arquivo_id" IS NOT NULL)`,
)
@Check(
  'ck_portais_layout_login',
  `("layout_login" = 'split' AND "posicao_midia_split" IS NOT NULL)
    OR ("layout_login" = 'centered' AND "posicao_midia_split" IS NULL)`,
)
@Entity({ name: 'portais' })
export class Portal {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ length: 100, name: 'nome_interno', type: 'varchar' })
  declare internalName: string;

  @Column({ length: 7, name: 'cor_light_primary', type: 'char' })
  declare lightPrimary: string;

  @Column({ length: 7, name: 'cor_light_secondary', type: 'char' })
  declare lightSecondary: string;

  @Column({ length: 7, name: 'cor_light_background', type: 'char' })
  declare lightBackground: string;

  @Column({ length: 7, name: 'cor_light_paper', type: 'char' })
  declare lightPaper: string;

  @Column({ length: 7, name: 'cor_light_success', type: 'char' })
  declare lightSuccess: string;

  @Column({ length: 7, name: 'cor_light_warning', type: 'char' })
  declare lightWarning: string;

  @Column({ length: 7, name: 'cor_light_error', type: 'char' })
  declare lightError: string;

  @Column({ length: 7, name: 'cor_dark_primary', type: 'char' })
  declare darkPrimary: string;

  @Column({ length: 7, name: 'cor_dark_secondary', type: 'char' })
  declare darkSecondary: string;

  @Column({ length: 7, name: 'cor_dark_background', type: 'char' })
  declare darkBackground: string;

  @Column({ length: 7, name: 'cor_dark_paper', type: 'char' })
  declare darkPaper: string;

  @Column({ length: 7, name: 'cor_dark_success', type: 'char' })
  declare darkSuccess: string;

  @Column({ length: 7, name: 'cor_dark_warning', type: 'char' })
  declare darkWarning: string;

  @Column({ length: 7, name: 'cor_dark_error', type: 'char' })
  declare darkError: string;

  @Column({
    enum: PortalFontScale,
    enumName: 'escala_fonte_portal',
    name: 'escala_fonte',
    type: 'enum',
  })
  declare fontScale: PortalFontScale;

  @Column({ length: 500, name: 'url_suporte', nullable: true, type: 'varchar' })
  declare supportUrl: string | null;

  @Column({
    enum: PortalLoginHeaderMode,
    enumName: 'modo_header_login_portal',
    name: 'modo_header_login',
    type: 'enum',
  })
  declare loginHeaderMode: PortalLoginHeaderMode;

  @Column({
    enum: PortalLoginLayout,
    enumName: 'layout_login_portal',
    name: 'layout_login',
    type: 'enum',
  })
  declare loginLayout: PortalLoginLayout;

  @Column({
    enum: PortalSplitMediaPosition,
    enumName: 'posicao_midia_login_portal',
    name: 'posicao_midia_split',
    nullable: true,
    type: 'enum',
  })
  declare splitMediaPosition: PortalSplitMediaPosition | null;

  @ManyToOne(() => File, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_portais_favicon_arquivo',
    name: 'favicon_arquivo_id',
  })
  declare faviconFile: File | null;

  @ManyToOne(() => File, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_portais_icone_header_arquivo',
    name: 'icone_header_arquivo_id',
  })
  declare headerIconFile: File | null;

  @ManyToOne(() => File, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_portais_brand_asset_arquivo',
    name: 'brand_asset_arquivo_id',
  })
  declare brandAssetFile: File | null;

  @OneToMany(() => PortalDomain, (domain) => domain.portal, { cascade: true })
  declare domains: PortalDomain[];

  @OneToMany(() => PortalTranslation, (translation) => translation.portal, { cascade: true })
  declare translations: PortalTranslation[];

  @OneToMany(() => PortalLoginMedia, (media) => media.portal, { cascade: true })
  declare loginMedia: PortalLoginMedia[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
