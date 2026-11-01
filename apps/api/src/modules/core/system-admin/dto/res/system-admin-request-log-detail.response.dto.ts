import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type LogPayload, type SystemAdminRequestLogDetail } from '@contenster/shared';

import { SystemAdminRequestLogListItemResponseDto } from './system-admin-request-log-list-item.response.dto';

export class SystemAdminRequestLogDetailResponseDto
  extends SystemAdminRequestLogListItemResponseDto
  implements SystemAdminRequestLogDetail
{
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
}
