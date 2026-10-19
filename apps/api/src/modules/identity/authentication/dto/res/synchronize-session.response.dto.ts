import type { SynchronizeSessionResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { SessionResponseDto } from './session.response.dto';

export class SynchronizeSessionResponseDto
  extends SessionResponseDto
  implements SynchronizeSessionResponse
{
  @Expose()
  @ApiProperty({ type: Boolean })
  declare sessionChanged: boolean;
}
