import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PortalLoginMediaSlot, PortalLoginMediaType } from '@contenster/shared';
import { File } from '@/modules/media/files/entities/file.entity';

import { Portal } from './portal.entity';

@Index('uq_portais_midias_login_portal_slot', ['portal', 'slot'], { unique: true })
@Entity({ name: 'portais_midias_login' })
export class PortalLoginMedia {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => Portal, (portal) => portal.loginMedia, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_portais_midias_login_portal', name: 'portal_id' })
  declare portal: Portal;

  @Column({
    enum: PortalLoginMediaSlot,
    enumName: 'slot_midia_login_portal',
    name: 'slot',
    type: 'enum',
  })
  declare slot: PortalLoginMediaSlot;

  @Column({
    enum: PortalLoginMediaType,
    enumName: 'tipo_midia_login_portal',
    name: 'tipo_midia',
    type: 'enum',
  })
  declare mediaType: PortalLoginMediaType;

  @ManyToOne(() => File, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_portais_midias_login_arquivo', name: 'arquivo_id' })
  declare file: File;

  @ManyToOne(() => File, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    foreignKeyConstraintName: 'fk_portais_midias_login_poster_arquivo',
    name: 'poster_arquivo_id',
  })
  declare posterFile: File | null;
}
