import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CronExecutionStatus } from '@contenster/shared';
import type { SanitizedLogPayload } from '@/shared/utils/logger-redaction.util';

@Index('idx_logs_execucoes_rotinas_nome_criado_em', ['taskName', 'createdAt'])
@Index('idx_logs_execucoes_rotinas_status_criado_em', ['status', 'createdAt'])
@Entity({ name: 'logs_execucoes_rotinas' })
export class CronExecutionLog {
  @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
  id!: number;

  @Column({ length: 100, name: 'nome_rotina', type: 'varchar' })
  taskName!: string;

  @Column({
    enum: CronExecutionStatus,
    enumName: 'status_execucao_rotina',
    name: 'status',
    type: 'enum',
  })
  status!: CronExecutionStatus;

  @Column({ name: 'iniciou_em', type: 'timestamp' })
  startedAt!: Date;

  @Column({ name: 'finalizou_em', nullable: true, type: 'timestamp' })
  finishedAt!: Date | null;

  @Column({ name: 'duracao_ms', nullable: true, type: 'integer' })
  durationMs!: number | null;

  @Column({ name: 'total_processado', nullable: true, type: 'integer' })
  totalProcessed!: number | null;

  @Column({ name: 'total_sucesso', nullable: true, type: 'integer' })
  totalSuccess!: number | null;

  @Column({ name: 'total_erro', nullable: true, type: 'integer' })
  totalError!: number | null;

  @Column({ name: 'mensagem', nullable: true, type: 'text' })
  message!: string | null;

  @Column({ name: 'erro', nullable: true, type: 'jsonb' })
  error!: SanitizedLogPayload;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  updatedAt!: Date;
}
