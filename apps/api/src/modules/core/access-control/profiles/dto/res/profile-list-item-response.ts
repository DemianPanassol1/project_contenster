import type { ProfileListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileListItemResponseDto implements ProfileListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare isAdmin: boolean;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}
