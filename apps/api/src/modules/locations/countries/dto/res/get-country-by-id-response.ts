import type { GetCountryByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { CountryListItemResponseDto } from './country-list-item-response.js';

class CountryTranslationResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare locale: string;

  @Expose()
  @ApiProperty()
  declare name: string;
}

export class GetCountryByIdResponseDto
  extends CountryListItemResponseDto
  implements GetCountryByIdResponse
{
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare phoneCode: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare currencyCode: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare locale: string | null;

  @Expose()
  @Type(() => CountryTranslationResponseDto)
  @ApiProperty({ type: [CountryTranslationResponseDto] })
  declare translations: CountryTranslationResponseDto[];
}
