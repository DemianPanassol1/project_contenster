import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { File } from '@/modules/media/files/entities/file.entity';

import { UserProfile } from './user-profile.entity';

@Entity({ name: 'usuarios' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @ManyToOne(() => File, (file) => file.users, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'imagem_id' })
  declare image: File | null;

  @Column({ length: 255, name: 'nome', type: 'varchar' })
  declare name: string;

  @Index('uq_usuarios_email', { unique: true })
  @Column({ length: 255, name: 'email', type: 'varchar' })
  declare email: string;

  @Index('uq_usuarios_nome_usuario', { unique: true })
  @Column({ length: 75, name: 'nome_usuario', type: 'varchar' })
  declare username: string;

  @Column({ length: 30, name: 'telefone_principal', type: 'varchar' })
  declare primaryPhone: string;

  @Column({ length: 30, name: 'telefone_secundario', nullable: true, type: 'varchar' })
  declare secondaryPhone: string | null;

  @Column({ name: 'senha_hash', type: 'text' })
  declare passwordHash: string;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  declare isActive: boolean;

  @Column({ default: false, name: 'eh_bloqueado', type: 'boolean' })
  declare isBlocked: boolean;

  @Column({ default: false, name: 'eh_super_usuario', type: 'boolean' })
  declare isSuperuser: boolean;

  @Column({ name: 'ultimo_login_em', nullable: true, type: 'timestamp' })
  declare lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  declare updatedAt: Date;

  @DeleteDateColumn({ name: 'deletado_em', nullable: true, type: 'timestamp' })
  declare deletedAt: Date | null;

  @OneToMany(() => UserProfile, (userProfile) => userProfile.user)
  declare userProfiles: UserProfile[];

  @OneToMany(() => File, (file) => file.uploadedBy)
  declare uploadedFiles: File[];
}
