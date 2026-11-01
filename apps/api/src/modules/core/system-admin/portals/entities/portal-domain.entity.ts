import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Portal } from './portal.entity';

@Index('uq_portais_dominios_host', ['host'], { unique: true })
@Entity({ name: 'portais_dominios' })
export class PortalDomain {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ length: 253, name: 'host', type: 'varchar' })
  declare host: string;

  @ManyToOne(() => Portal, (portal) => portal.domains, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ foreignKeyConstraintName: 'fk_portais_dominios_portal', name: 'portal_id' })
  declare portal: Portal;
}
