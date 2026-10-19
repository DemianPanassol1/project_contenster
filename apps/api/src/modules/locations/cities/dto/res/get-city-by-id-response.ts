import type { GetCityByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { CityListItemResponseDto } from './city-list-item-response.js';

class TranslationResponseDto {
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

export class GetCityByIdResponseDto extends CityListItemResponseDto implements GetCityByIdResponse {
  @Expose()
  @Type(() => TranslationResponseDto)
  @ApiProperty({ type: [TranslationResponseDto] })
  declare translations: TranslationResponseDto[];
}
