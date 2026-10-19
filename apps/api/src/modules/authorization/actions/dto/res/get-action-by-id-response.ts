import type { GetActionByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ActionListItemResponseDto } from './action-list-item-response.js';

class ActionTranslationResponseDto {
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

export class GetActionByIdResponseDto
  extends ActionListItemResponseDto
  implements GetActionByIdResponse
{
  @Expose()
  @Type(() => ActionTranslationResponseDto)
  @ApiProperty({ type: [ActionTranslationResponseDto] })
  declare translations: ActionTranslationResponseDto[];
}
