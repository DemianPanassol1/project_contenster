import type { GetCityByIdResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { CityListItemResponseDto } from './city-list-item-response.js';

class TranslationResponseDto {
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

export class GetCityByIdResponseDto extends CityListItemResponseDto implements GetCityByIdResponse {
  @Expose()
  @Type(() => TranslationResponseDto)
  @ApiProperty({ type: [TranslationResponseDto] })
  declare translations: TranslationResponseDto[];
}
