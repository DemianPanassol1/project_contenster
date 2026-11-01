import type { SaveCountryRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import {
  toBoolean,
  toLowercaseString,
  toNumber,
  toString,
  toUppercaseString,
} from '@/shared/transformers/dto';

const ISO2_MAX_LENGTH = 2;
const ISO3_MAX_LENGTH = 3;
const CODE_MAX_LENGTH = 10;

class TranslationRequestDto {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare locale: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare name: string;
}

export class SaveCountryRequestDto implements SaveCountryRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toUppercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(ISO2_MAX_LENGTH, { message: i18n('validation.max_length', { max: ISO2_MAX_LENGTH }) })
  @ApiProperty()
  declare iso2: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(ISO3_MAX_LENGTH, { message: i18n('validation.max_length', { max: ISO3_MAX_LENGTH }) })
  @ApiPropertyOptional({ nullable: true })
  declare iso3: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(CODE_MAX_LENGTH, { message: i18n('validation.max_length', { max: CODE_MAX_LENGTH }) })
  @ApiPropertyOptional({ nullable: true })
  declare phoneCode: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(ISO3_MAX_LENGTH, { message: i18n('validation.max_length', { max: ISO3_MAX_LENGTH }) })
  @ApiPropertyOptional({ nullable: true })
  declare currencyCode: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(CODE_MAX_LENGTH, { message: i18n('validation.max_length', { max: CODE_MAX_LENGTH }) })
  @ApiPropertyOptional({ nullable: true })
  declare locale: string | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => TranslationRequestDto)
  @ApiProperty({ type: [TranslationRequestDto] })
  declare translations: TranslationRequestDto[];
}
