import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type CronExecutionLogDetail, type LogPayload } from '@contenster/shared';

import { SystemAdminJobLogListItemResponseDto } from './system-admin-job-log-list-item.response.dto';

export class SystemAdminJobLogDetailResponseDto
  extends SystemAdminJobLogListItemResponseDto
  implements CronExecutionLogDetail
{
  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare error: LogPayload;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare finishedAt: string | null;

  @Expose()
  @ApiProperty()
  declare startedAt: string;
}
