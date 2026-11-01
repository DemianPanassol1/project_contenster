import type { GetProfileByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ProfileListItemResponseDto } from './profile-list-item-response.js';

class ProfileTranslationResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare locale: string;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}

class ProfilePermissionAssignmentResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare functionalityId: number;

  @Expose()
  @ApiProperty()
  declare actionId: number;
}

export class GetProfileByIdResponseDto
  extends ProfileListItemResponseDto
  implements GetProfileByIdResponse
{
  @Expose()
  @Type(() => ProfileTranslationResponseDto)
  @ApiProperty({ type: [ProfileTranslationResponseDto] })
  declare translations: ProfileTranslationResponseDto[];

  @Expose()
  @Type(() => ProfilePermissionAssignmentResponseDto)
  @ApiProperty({ type: [ProfilePermissionAssignmentResponseDto] })
  declare permissions: ProfilePermissionAssignmentResponseDto[];
}
