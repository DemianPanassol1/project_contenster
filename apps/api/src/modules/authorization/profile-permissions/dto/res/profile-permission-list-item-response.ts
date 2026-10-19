import type { ProfilePermissionListItem } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfilePermissionListItemResponseDto implements ProfilePermissionListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare profileId: number;

  @Expose()
  @ApiProperty()
  declare functionalityId: number;

  @Expose()
  @ApiProperty()
  declare actionId: number;
}
