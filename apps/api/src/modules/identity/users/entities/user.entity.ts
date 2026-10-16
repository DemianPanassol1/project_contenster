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
  id!: number;

  @ManyToOne(() => File, (file) => file.users, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'imagem_id' })
  image!: File | null;

  @Column({ length: 255, name: 'nome', type: 'varchar' })
  name!: string;

  @Index('uq_usuarios_email', { unique: true })
  @Column({ length: 255, name: 'email', type: 'varchar' })
  email!: string;

  @Index('uq_usuarios_nome_usuario', { unique: true })
  @Column({ length: 75, name: 'nome_usuario', type: 'varchar' })
  username!: string;

  @Column({ length: 30, name: 'telefone_principal', type: 'varchar' })
  primaryPhone!: string;

  @Column({ length: 30, name: 'telefone_secundario', nullable: true, type: 'varchar' })
  secondaryPhone!: string | null;

  @Column({ name: 'senha_hash', type: 'text' })
  passwordHash!: string;

  @Column({ default: true, name: 'eh_ativo', type: 'boolean' })
  isActive!: boolean;

  @Column({ default: false, name: 'eh_bloqueado', type: 'boolean' })
  isBlocked!: boolean;

  @Column({ name: 'ultimo_login_em', nullable: true, type: 'timestamp' })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deletado_em', nullable: true, type: 'timestamp' })
  deletedAt!: Date | null;

  @OneToMany(() => UserProfile, (userProfile) => userProfile.user)
  userProfiles!: UserProfile[];

  @OneToMany(() => File, (file) => file.uploadedBy)
  uploadedFiles!: File[];
}
