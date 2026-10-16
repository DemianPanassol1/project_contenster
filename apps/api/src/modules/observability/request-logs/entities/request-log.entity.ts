import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RequestLogLevel } from '@contenster/shared';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';

type SanitizedLogPayload = Record<string, unknown> | unknown[] | string | number | boolean | null;

@Index('idx_logs_requisicoes_nivel_criado_em', ['level', 'createdAt'])
@Index('idx_logs_requisicoes_usuario_criado_em', ['user', 'createdAt'])
@Index('idx_logs_requisicoes_cliente_criado_em', ['client', 'createdAt', 'id'])
@Entity({ name: 'logs_requisicoes' })
export class RequestLog {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @Column({ enum: RequestLogLevel, enumName: 'nivel_log_requisicao', name: 'nivel', type: 'enum' })
  level!: RequestLogLevel;

  @Column({ length: 36, name: 'request_id', type: 'char' })
  requestId!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  user!: User | null;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cliente_id' })
  client!: Client | null;

  @Column({ length: 100, name: 'tipo_evento', nullable: true, type: 'varchar' })
  eventType!: string | null;

  @Column({ length: 10, name: 'metodo_http', type: 'varchar' })
  method!: string;

  @Column({ length: 255, name: 'rota', type: 'varchar' })
  route!: string;

  @Column({ name: 'tempo_resposta_ms', type: 'integer' })
  responseTimeMs!: number;

  @Column({ length: 25, name: 'tempo_resposta_desc', type: 'varchar' })
  responseTimeDescription!: string;

  @Column({ name: 'status_code', type: 'integer' })
  statusCode!: number;

  @Column({ name: 'headers_requisicao', nullable: true, type: 'jsonb' })
  requestHeaders!: SanitizedLogPayload;

  @Column({ name: 'corpo_requisicao', nullable: true, type: 'jsonb' })
  requestBody!: SanitizedLogPayload;

  @Column({ name: 'headers_resposta', nullable: true, type: 'jsonb' })
  responseHeaders!: SanitizedLogPayload;

  @Column({ name: 'corpo_resposta', nullable: true, type: 'jsonb' })
  responseBody!: SanitizedLogPayload;

  @Column({ length: 45, name: 'ip', nullable: true, type: 'varchar' })
  ip!: string | null;

  @Column({ length: 255, name: 'user_agent', nullable: true, type: 'varchar' })
  userAgent!: string | null;

  @Column({ name: 'query_params', nullable: true, type: 'jsonb' })
  queryParams!: SanitizedLogPayload;

  @Column({ name: 'erro', nullable: true, type: 'jsonb' })
  error!: SanitizedLogPayload;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;
}
