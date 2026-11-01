import type { SaveLanguageRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toLowercaseString, toNumber, toString } from '@/shared/transformers/dto';

const NAME_MAX_LENGTH = 100;
const CODE_MAX_LENGTH = 10;

export class SaveLanguageRequestDto implements SaveLanguageRequest {
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
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(CODE_MAX_LENGTH, { message: i18n('validation.max_length', { max: CODE_MAX_LENGTH }) })
  @ApiProperty()
  declare languageCode: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(CODE_MAX_LENGTH, { message: i18n('validation.max_length', { max: CODE_MAX_LENGTH }) })
  @ApiProperty()
  declare regionCode: string;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare iconId: number | null;
}
