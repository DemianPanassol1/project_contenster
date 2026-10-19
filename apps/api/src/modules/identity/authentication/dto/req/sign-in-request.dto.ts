import type { SignInRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toBoolean, toInteger } from '@/shared/transformers/dto';

import { AuthorizeRequestDto } from './authorize-request.dto';

export class SignInRequestDto extends AuthorizeRequestDto implements SignInRequest {
  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiProperty({ type: Number })
  declare clientId: number;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty({ type: Boolean })
  declare staySignedIn: boolean;
}
