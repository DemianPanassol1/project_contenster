import {
  CreateDateColumn,
  Entity,
  ForeignKey,
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
@Index('idx_usuarios_perfis_perfil_cliente', ['profile', 'client'])
@Unique('uq_usuarios_perfis_usuario_cliente', ['user', 'client'])
@ForeignKey(() => Profile, ['perfil_id', 'cliente_id'], ['id', 'cliente_id'], {
  name: 'fk_usuarios_perfis_perfil_cliente',
  onDelete: 'CASCADE',
})
@Entity({ name: 'usuarios_perfis' })
export class UserProfile {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => User, (user) => user.userProfiles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_usuarios_perfis_usuario', name: 'usuario_id' })
  declare user: User;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_usuarios_perfis_cliente', name: 'cliente_id' })
  declare client: Client;

  @ManyToOne(() => Profile, (profile) => profile.userProfiles, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'perfil_id' })
  declare profile: Profile;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;
}
