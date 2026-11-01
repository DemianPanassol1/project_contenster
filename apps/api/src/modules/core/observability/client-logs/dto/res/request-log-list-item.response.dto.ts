import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { RequestLogLevel, type RequestLogListItem } from '@contenster/shared';

export class RequestLogListItemResponseDto implements RequestLogListItem {
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
