import type { GetCurrentUserProfileResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CurrentUserProfileResponseDto implements GetCurrentUserProfileResponse {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiProperty()
  declare email: string;

  @Expose()
  @ApiProperty()
  declare username: string;

  @Expose()
  @ApiProperty()
  declare primaryPhone: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare secondaryPhone: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;
}
