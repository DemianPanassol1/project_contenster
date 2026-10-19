import type { ForgotPasswordResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ForgotPasswordResponseDto implements ForgotPasswordResponse {
  @Expose()
  @ApiProperty({ type: Boolean })
  declare emailSent: boolean;
}
