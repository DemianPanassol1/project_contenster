import type { SaveUserRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import {
  toBoolean,
  toInteger,
  toLowercaseString,
  toNumber,
  toString,
} from '@/shared/transformers/dto';

const NAME_MAX_LENGTH = 255;
const EMAIL_MAX_LENGTH = 255;
const USERNAME_MAX_LENGTH = 75;
const PHONE_MAX_LENGTH = 30;
const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 255;

export class SaveUserRequestDto implements SaveUserRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

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

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: i18n('validation.min_length', { min: PASSWORD_MIN_LENGTH }),
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: PASSWORD_MAX_LENGTH }),
  })
  @ApiPropertyOptional({ nullable: true })
  declare password: string | null;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare userProfileId: number | null;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare profileId: number;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isBlocked: boolean;
}
