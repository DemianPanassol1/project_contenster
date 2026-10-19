import type { ForgotPasswordRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toLowercaseString } from '@/shared/transformers/dto';

import { AUTH_USERNAME_MAX_LENGTH } from '../../constants/auth.constants';

export class ForgotPasswordRequestDto implements ForgotPasswordRequest {
  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @IsEmail({}, { message: i18n('validation.email') })
  @MaxLength(AUTH_USERNAME_MAX_LENGTH, { message: i18n('validation.max_length') })
  @ApiProperty({ type: String })
  declare email: string;
}
