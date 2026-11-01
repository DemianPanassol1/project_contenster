import type { GetUserByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { UserListItemResponseDto } from './user-list-item-response.js';

export class GetUserByIdResponseDto extends UserListItemResponseDto implements GetUserByIdResponse {
  @Expose()
  @ApiProperty()
  declare primaryPhone: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare secondaryPhone: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;

  @Expose()
  @ApiProperty()
  declare clientId: number;

  @Expose()
  @ApiProperty()
  declare userProfileId: number;

  @Expose()
  @ApiProperty()
  declare profileId: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare lastLoginAt: string | null;
}
