import type { UserListItem } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserListItemResponseDto implements UserListItem {
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
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare isBlocked: boolean;
}
