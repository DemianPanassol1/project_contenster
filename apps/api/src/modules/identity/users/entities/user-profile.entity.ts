import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Profile } from '@/modules/access-control/profiles/entities/profiles.entity';
import { Client } from '@/modules/identity/clients/entities/client.entity';

import { User } from './user.entity';

@Index('idx_usuarios_perfis_usuario', ['user'])
@Index('idx_usuarios_perfis_perfil', ['profile'])
@Unique('uq_usuarios_perfis_usuario_cliente', ['user', 'client'])
@Entity({ name: 'usuarios_perfis' })
export class UserProfile {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => User, (user) => user.userProfiles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  declare user: User;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  declare client: Client;

  @ManyToOne(() => Profile, (profile) => profile.userProfiles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'perfil_id', referencedColumnName: 'id' },
    { name: 'cliente_id', referencedColumnName: 'clientId' },
  ])
  declare profile: Profile;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
