import type { SystemModuleListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SystemModuleListItemResponseDto implements SystemModuleListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare order: number;

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
