import type { StateListItem } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StateListItemResponseDto implements StateListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare countryId: number;

  @Expose()
  @ApiProperty()
  declare countryName: string;

  @Expose()
  @ApiProperty()
  declare code: string;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;
}
