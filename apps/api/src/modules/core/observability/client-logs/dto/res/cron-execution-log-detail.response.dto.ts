import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import {
  type CronExecutionLogDetail,
  CronExecutionStatus,
  type LogPayload,
} from '@contenster/shared';

export class CronExecutionLogDetailResponseDto implements CronExecutionLogDetail {
  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare error: LogPayload;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare finishedAt: string | null;

  @Expose()
  @ApiProperty()
  declare startedAt: string;

  @Expose()
  @ApiProperty()
  declare createdAt: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare durationMs: number | null;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare message: string | null;

  @Expose()
  @ApiProperty({ enum: CronExecutionStatus })
  declare status: CronExecutionStatus;

  @Expose()
  @ApiProperty()
  declare taskName: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare totalError: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare totalProcessed: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare totalSuccess: number | null;
}
