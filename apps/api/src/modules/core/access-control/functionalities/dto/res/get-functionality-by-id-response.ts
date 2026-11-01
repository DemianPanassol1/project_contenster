import type { GetFunctionalityByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { FunctionalityListItemResponseDto } from './functionality-list-item-response.js';

class FunctionalityTranslationResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

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

class FunctionalityLanguageResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare languageId: number;
}

export class GetFunctionalityByIdResponseDto
  extends FunctionalityListItemResponseDto
  implements GetFunctionalityByIdResponse
{
  @Expose()
  @ApiProperty()
  declare clientId: number;

  @Expose()
  @Type(() => FunctionalityTranslationResponseDto)
  @ApiProperty({ type: [FunctionalityTranslationResponseDto] })
  declare translations: FunctionalityTranslationResponseDto[];

  @Expose()
  @Type(() => FunctionalityLanguageResponseDto)
  @ApiProperty({ type: [FunctionalityLanguageResponseDto] })
  declare languageLinks: FunctionalityLanguageResponseDto[];
}
