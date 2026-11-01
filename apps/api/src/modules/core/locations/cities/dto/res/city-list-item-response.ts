import type { CityListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CityListItemResponseDto implements CityListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare stateId: number;

  @Expose()
  @ApiProperty()
  declare stateCode: string;

  @Expose()
  @ApiProperty()
  declare stateName: string;

  @Expose()
  @ApiProperty()
  declare countryId: number;

  @Expose()
  @ApiProperty()
  declare countryName: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare ibgeCode: string | null;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;
}
