import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type ActionListItem, ActionType } from '@contenster/shared';

export class ActionListItemResponseDto implements ActionListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty({ enum: ActionType })
  declare type: ActionType;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}
