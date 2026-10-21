import type { TestStorageConnectionResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TestStorageConnectionResponseDto implements TestStorageConnectionResponse {
  @Expose()
  @ApiProperty()
  declare isAvailable: boolean;
}
