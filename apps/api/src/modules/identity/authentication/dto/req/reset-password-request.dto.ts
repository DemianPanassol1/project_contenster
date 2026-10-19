import type { ResetPasswordRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toString } from '@/shared/transformers/dto';

import { AUTH_PASSWORD_MAX_LENGTH, AUTH_PASSWORD_MIN_LENGTH } from '../../constants/auth.constants';

export class ResetPasswordRequestDto implements ResetPasswordRequest {
  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MinLength(AUTH_PASSWORD_MIN_LENGTH, { message: i18n('validation.min_length') })
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH, { message: i18n('validation.max_length') })
  @ApiProperty({ type: String })
  declare password: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty({ type: String })
  declare token: string;
}
