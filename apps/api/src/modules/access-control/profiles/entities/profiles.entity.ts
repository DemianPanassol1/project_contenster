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

import { ProfilePermission } from '@/modules/authorization/profile-permissions/entities/profile-permission.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { UserProfile } from '@/modules/identity/users/entities/user-profile.entity';

import { ProfileTranslation } from './profiles-translation.entity';

@Index('idx_perfis_cliente', ['client'])
@Unique('uq_perfis_id_cliente', ['id', 'clientId'])
@Entity({ name: 'perfis' })
export class Profile {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ name: 'cliente_id', type: 'integer' })
  declare clientId: number;

  @ManyToOne(() => Client, (client) => client.profiles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  declare client: Client;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @OneToMany(() => ProfileTranslation, (translation) => translation.profile, { cascade: true })
  declare translations: ProfileTranslation[];

  @OneToMany(() => UserProfile, (userProfile) => userProfile.profile)
  declare userProfiles: UserProfile[];

  @OneToMany(() => ProfilePermission, (permission) => permission.profile)
  declare permissions: ProfilePermission[];
}
