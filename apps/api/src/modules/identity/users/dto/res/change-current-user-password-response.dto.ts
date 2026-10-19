import type { ChangeCurrentUserPasswordResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ChangeCurrentUserPasswordResponseDto implements ChangeCurrentUserPasswordResponse {
  @Expose()
  @ApiProperty({ type: Boolean })
  declare passwordChanged: boolean;
}
