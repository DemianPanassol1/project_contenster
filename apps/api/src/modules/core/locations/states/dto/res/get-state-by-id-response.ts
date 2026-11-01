import type { GetStateByIdResponse } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { StateListItemResponseDto } from './state-list-item-response.js';

class StateTranslationResponseDto {
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

export class GetStateByIdResponseDto
  extends StateListItemResponseDto
  implements GetStateByIdResponse
{
  @Expose()
  @Type(() => StateTranslationResponseDto)
  @ApiProperty({ type: [StateTranslationResponseDto] })
  declare translations: StateTranslationResponseDto[];
}
