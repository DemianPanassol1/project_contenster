import type { ResetPasswordResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResetPasswordResponseDto implements ResetPasswordResponse {
  @Expose()
  @ApiProperty({ type: Boolean })
  declare passwordReset: boolean;
}
