import type { CountryListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CountryListItemResponseDto implements CountryListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare iso2: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare iso3: string | null;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;
}
