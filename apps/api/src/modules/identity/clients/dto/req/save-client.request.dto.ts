import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { DocumentType, type SaveClientRequest } from '@contenster/shared';
import { i18n } from '@/i18n/i18n.util';
import {
  toBoolean,
  toLowercaseString,
  toNumber,
  toNumberArray,
  toString,
} from '@/shared/transformers/dto';

const COMPANY_NAME_MAX_LENGTH = 150;
const DOCUMENT_MAX_LENGTH = 30;
const EMAIL_MAX_LENGTH = 150;
const PHONE_MAX_LENGTH = 30;
const ADDRESS_MAX_LENGTH = 150;
const ADDRESS_NUMBER_MAX_LENGTH = 20;
const ZIP_CODE_MAX_LENGTH = 10;
const NEIGHBORHOOD_MAX_LENGTH = 100;
const SLUG_MAX_LENGTH = 75;
export class SaveClientRequestDto implements SaveClientRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(COMPANY_NAME_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: COMPANY_NAME_MAX_LENGTH }),
  })
  @ApiProperty()
  declare corporateName: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(COMPANY_NAME_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: COMPANY_NAME_MAX_LENGTH }),
  })
  @ApiProperty()
  declare tradeName: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(DOCUMENT_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: DOCUMENT_MAX_LENGTH }),
  })
  @ApiProperty()
  declare document: string;

  @IsEnum(DocumentType, { message: i18n('validation.enum') })
  @ApiProperty({ enum: DocumentType })
  declare documentType: DocumentType;

  @Transform(toLowercaseString)
  @IsEmail({}, { message: i18n('validation.email') })
  @MaxLength(EMAIL_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: EMAIL_MAX_LENGTH }),
  })
  @ApiProperty()
  declare email: string;

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
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(ADDRESS_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: ADDRESS_MAX_LENGTH }),
  })
  @ApiProperty()
  declare address: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(ADDRESS_NUMBER_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: ADDRESS_NUMBER_MAX_LENGTH }),
  })
  @ApiProperty()
  declare addressNumber: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(ZIP_CODE_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: ZIP_CODE_MAX_LENGTH }),
  })
  @ApiProperty()
  declare zipCode: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(NEIGHBORHOOD_MAX_LENGTH, {
    message: i18n('validation.max_length', { max: NEIGHBORHOOD_MAX_LENGTH }),
  })
  @ApiProperty()
  declare neighborhood: string;

  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(SLUG_MAX_LENGTH, { message: i18n('validation.max_length', { max: SLUG_MAX_LENGTH }) })
  @ApiProperty()
  declare slug: string;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare cityId: number | null;

  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @Transform(toNumberArray)
  @IsArray({ message: i18n('validation.array') })
  @ApiProperty({ type: [Number] })
  declare languageIds: number[];
}
