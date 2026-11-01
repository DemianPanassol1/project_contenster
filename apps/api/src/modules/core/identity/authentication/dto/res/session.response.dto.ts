import type { SessionResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { AuthenticatedSessionResponseDto } from './authenticated-session.response.dto';

export class SessionResponseDto implements SessionResponse {
  @Expose()
  @ApiProperty({ format: 'date-time', type: String })
  declare expiresAt: string;

  @Expose()
  @Type(() => AuthenticatedSessionResponseDto)
  @ApiProperty({ type: AuthenticatedSessionResponseDto })
  declare session: AuthenticatedSessionResponseDto;
}
