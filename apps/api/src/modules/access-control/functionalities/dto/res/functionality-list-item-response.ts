import type { FunctionalityListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FunctionalityListItemResponseDto implements FunctionalityListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare moduleId: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare parentId: number | null;

  @Expose()
  @ApiProperty()
  declare slug: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare icon: string | null;

  @Expose()
  @ApiProperty()
  declare order: number;

  @Expose()
  @ApiProperty()
  declare isNavigationGroup: boolean;

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
