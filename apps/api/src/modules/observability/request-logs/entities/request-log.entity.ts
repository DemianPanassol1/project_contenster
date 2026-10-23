import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RequestLogAccessType, RequestLogLevel } from '@contenster/shared';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import type { SanitizedLogPayload } from '@/shared/utils/logger-redaction.util';

@Index('idx_logs_requisicoes_nivel_criado_em', ['level', 'createdAt'])
@Index('idx_logs_requisicoes_usuario_criado_em', ['user', 'createdAt'])
@Index('idx_logs_requisicoes_cliente_criado_em', ['client', 'createdAt', 'id'])
@Entity({ name: 'logs_requisicoes' })
export class RequestLog {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  declare id: number;

  @Column({ enum: RequestLogLevel, enumName: 'nivel_log_requisicao', name: 'nivel', type: 'enum' })
  declare level: RequestLogLevel;

  @Column({ length: 36, name: 'request_id', type: 'char' })
  declare requestId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_logs_requisicoes_usuario', name: 'usuario_id' })
  declare user: User | null;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ foreignKeyConstraintName: 'fk_logs_requisicoes_cliente', name: 'cliente_id' })
  declare client: Client | null;

  @Column({
    enum: RequestLogAccessType,
    enumName: 'tipo_acesso_log_requisicao',
    name: 'tipo_acesso',
    type: 'enum',
  })
  declare accessType: RequestLogAccessType;

  @Column({ length: 100, name: 'tipo_evento', nullable: true, type: 'varchar' })
  declare eventType: string | null;

  @Column({ length: 10, name: 'metodo_http', type: 'varchar' })
  declare method: string;

  @Column({ length: 255, name: 'rota', type: 'varchar' })
  declare route: string;

  @Column({ name: 'tempo_resposta_ms', type: 'integer' })
  declare responseTimeMs: number;

  @Column({ length: 25, name: 'tempo_resposta_desc', type: 'varchar' })
  declare responseTimeDescription: string;

  @Column({ name: 'status_code', type: 'integer' })
  declare statusCode: number;

  @Column({ name: 'headers_requisicao', nullable: true, type: 'jsonb' })
  declare requestHeaders: SanitizedLogPayload;

  @Column({ name: 'corpo_requisicao', nullable: true, type: 'jsonb' })
  declare requestBody: SanitizedLogPayload;

  @Column({ name: 'headers_resposta', nullable: true, type: 'jsonb' })
  declare responseHeaders: SanitizedLogPayload;

  @Column({ name: 'corpo_resposta', nullable: true, type: 'jsonb' })
  declare responseBody: SanitizedLogPayload;

  @Column({ length: 45, name: 'ip', nullable: true, type: 'varchar' })
  declare ip: string | null;

  @Column({ length: 255, name: 'user_agent', nullable: true, type: 'varchar' })
  declare userAgent: string | null;

  @Column({ name: 'query_params', nullable: true, type: 'jsonb' })
  declare queryParams: SanitizedLogPayload;

  @Column({ name: 'erro', nullable: true, type: 'jsonb' })
  declare error: SanitizedLogPayload;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  declare createdAt: Date;
}
