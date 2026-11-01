import type { SwitchClientRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toInteger } from '@/shared/transformers/dto';

export class SwitchClientRequestDto implements SwitchClientRequest {
  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiProperty({ type: Number })
  declare clientId: number;
}
