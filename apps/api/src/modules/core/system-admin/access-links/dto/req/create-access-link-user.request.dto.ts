import type { CreateSystemAdminAccessLinkUserRequest } from '@contenster/shared';
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
import { toBoolean, toLowercaseString, toNumber, toString } from '@/shared/transformers/dto';

export class CreateAccessLinkUserRequestDto implements CreateSystemAdminAccessLinkUserRequest {
  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(255, { message: i18n('validation.max_length', { max: 255 }) })
  @ApiProperty()
  declare name: string;

  @Transform(toLowercaseString)
  @IsEmail({}, { message: i18n('validation.email') })
  @MaxLength(255, { message: i18n('validation.max_length', { max: 255 }) })
  @ApiProperty()
  declare email: string;

  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(75, { message: i18n('validation.max_length', { max: 75 }) })
  @ApiProperty()
  declare username: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(30, { message: i18n('validation.max_length', { max: 30 }) })
  @ApiProperty()
  declare primaryPhone: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(30, { message: i18n('validation.max_length', { max: 30 }) })
  @ApiPropertyOptional({ nullable: true })
  declare secondaryPhone: string | null;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MinLength(5, { message: i18n('validation.min_length', { min: 5 }) })
  @MaxLength(255, { message: i18n('validation.max_length', { max: 255 }) })
  @ApiProperty()
  declare password: string;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isBlocked: boolean;
}
