import type { SignOutResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SignOutResponseDto implements SignOutResponse {
  @Expose()
  @ApiProperty({ type: Boolean })
  declare signedOut: boolean;
}
