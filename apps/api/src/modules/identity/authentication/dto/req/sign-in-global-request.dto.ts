import type { SignInGlobalRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toBoolean } from '@/shared/transformers/dto';

import { AuthorizeRequestDto } from './authorize-request.dto';

export class SignInGlobalRequestDto extends AuthorizeRequestDto implements SignInGlobalRequest {
  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty({ type: Boolean })
  declare staySignedIn: boolean;
}
