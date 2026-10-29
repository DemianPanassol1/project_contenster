import type { SaveCurrentUserProfileRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toLowercaseString, toNumber, toString } from '@/shared/transformers/dto';

const NAME_MAX_LENGTH = 255;
const EMAIL_MAX_LENGTH = 255;
const USERNAME_MAX_LENGTH = 75;
const PHONE_MAX_LENGTH = 30;

export class SaveCurrentUserProfileRequestDto implements SaveCurrentUserProfileRequest {
  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(NAME_MAX_LENGTH, { message: i18n('validation.max_length', { max: NAME_MAX_LENGTH }) })
  @ApiProperty()
  declare name: string;

  @Transform(toLowercaseString)
  @IsEmail({}, { message: i18n('validation.email') })
  @MaxLength(EMAIL_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: EMAIL_MAX_LENGTH }),
  })
  @ApiProperty()
  declare email: string;

  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: USERNAME_MAX_LENGTH }),
  })
  @ApiProperty()
  declare username: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(PHONE_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: PHONE_MAX_LENGTH }),
  })
  @ApiProperty()
  declare primaryPhone: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(PHONE_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: PHONE_MAX_LENGTH }),
  })
  @ApiPropertyOptional({ nullable: true })
  declare secondaryPhone: string | null;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;
}
