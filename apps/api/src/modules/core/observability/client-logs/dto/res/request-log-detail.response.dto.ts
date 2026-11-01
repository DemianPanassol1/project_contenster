import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type LogPayload, type RequestLogDetail, RequestLogLevel } from '@contenster/shared';

export class RequestLogDetailResponseDto implements RequestLogDetail {
  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare error: LogPayload;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare eventType: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare queryParams: LogPayload;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare requestBody: LogPayload;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare requestHeaders: LogPayload;

  @Expose()
  @ApiProperty()
  declare requestId: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare responseBody: LogPayload;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare responseHeaders: LogPayload;

  @Expose()
  @ApiProperty()
  declare responseTimeDescription: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare userAgent: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare clientId: number | null;

  @Expose()
  @ApiProperty()
  declare createdAt: string;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare ip: string | null;

  @Expose()
  @ApiProperty({ enum: RequestLogLevel })
  declare level: RequestLogLevel;

  @Expose()
  @ApiProperty()
  declare method: string;

  @Expose()
  @ApiProperty()
  declare responseTimeMs: number;

  @Expose()
  @ApiProperty()
  declare route: string;

  @Expose()
  @ApiProperty()
  declare statusCode: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare userName: string | null;
}
