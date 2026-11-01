import type { SetSystemAdminClientActiveRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toBoolean } from '@/shared/transformers/dto';

export class SetSystemAdminClientActiveRequestDto implements SetSystemAdminClientActiveRequest {
  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty({ type: Boolean })
  declare isActive: boolean;
}
