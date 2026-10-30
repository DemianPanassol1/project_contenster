import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  type PortalDomainRequest,
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  type PortalLoginMediaRequest,
  PortalLoginMediaSlot,
  PortalLoginMediaType,
  type PortalPalette,
  PortalSplitMediaPosition,
  type PortalTranslationRequest,
  type SavePortalRequest,
} from '@contenster/shared';
import { i18n } from '@/i18n/i18n.util';
import { toInteger, toString } from '@/shared/transformers/dto';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export class PortalPaletteRequestDto implements PortalPalette {
  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare primary: string;

  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare secondary: string;

  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare background: string;

  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare paper: string;

  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare success: string;

  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare warning: string;

  @Transform(toString)
  @Matches(HEX_COLOR_PATTERN, { message: i18n('validation.matches') })
  @ApiProperty()
  declare error: string;
}

export class PortalTranslationRequestDto implements PortalTranslationRequest {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toString)
  @IsString({ message: i18n('validation.string') })
  @MaxLength(2, { message: i18n('validation.max_length', { max: 2 }) })
  @ApiProperty({ example: 'pt' })
  declare locale: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length', { max: 150 }) })
  @ApiPropertyOptional({ nullable: true })
  declare applicationName: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(500, { message: i18n('validation.max_length', { max: 500 }) })
  @ApiPropertyOptional({ nullable: true })
  declare applicationDescription: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length', { max: 150 }) })
  @ApiPropertyOptional({ nullable: true })
  declare loginTitle: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(500, { message: i18n('validation.max_length', { max: 500 }) })
  @ApiPropertyOptional({ nullable: true })
  declare loginDescription: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(250, { message: i18n('validation.max_length', { max: 250 }) })
  @ApiPropertyOptional({ nullable: true })
  declare loginBrandAssetAlt: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(250, { message: i18n('validation.max_length', { max: 250 }) })
  @ApiPropertyOptional({ nullable: true })
  declare supportText: string | null;
}

export class PortalDomainRequestDto implements PortalDomainRequest {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(253, { message: i18n('validation.max_length', { max: 253 }) })
  @ApiProperty()
  declare host: string;
}

export class PortalLoginMediaRequestDto implements PortalLoginMediaRequest {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @IsEnum(PortalLoginMediaSlot, { message: i18n('validation.enum') })
  @ApiProperty({ enum: PortalLoginMediaSlot })
  declare slot: PortalLoginMediaSlot;

  @IsEnum(PortalLoginMediaType, { message: i18n('validation.enum') })
  @ApiProperty({ enum: PortalLoginMediaType })
  declare mediaType: PortalLoginMediaType;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiProperty()
  declare fileId: number;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare posterFileId: number | null;
}

export class SavePortalRequestDto implements SavePortalRequest {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(100, { message: i18n('validation.max_length', { max: 100 }) })
  @ApiProperty()
  declare internalName: string;

  @IsArray({ message: i18n('validation.array') })
  @ArrayMinSize(1, { message: i18n('validation.min_items') })
  @Type(() => PortalDomainRequestDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [PortalDomainRequestDto] })
  declare hosts: PortalDomainRequestDto[];

  @Type(() => PortalPaletteRequestDto)
  @ValidateNested()
  @ApiProperty({ type: PortalPaletteRequestDto })
  declare lightPalette: PortalPaletteRequestDto;

  @Type(() => PortalPaletteRequestDto)
  @ValidateNested()
  @ApiProperty({ type: PortalPaletteRequestDto })
  declare darkPalette: PortalPaletteRequestDto;

  @IsEnum(PortalFontScale, { message: i18n('validation.enum') })
  @ApiProperty({ enum: PortalFontScale })
  declare fontScale: PortalFontScale;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare faviconFileId: number | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(500, { message: i18n('validation.max_length', { max: 500 }) })
  @ApiPropertyOptional({ nullable: true })
  declare supportUrl: string | null;

  @IsEnum(PortalLoginHeaderMode, { message: i18n('validation.enum') })
  @ApiProperty({ enum: PortalLoginHeaderMode })
  declare loginHeaderMode: PortalLoginHeaderMode;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare headerIconFileId: number | null;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true })
  declare brandAssetFileId: number | null;

  @IsEnum(PortalLoginLayout, { message: i18n('validation.enum') })
  @ApiProperty({ enum: PortalLoginLayout })
  declare loginLayout: PortalLoginLayout;

  @IsOptional()
  @IsEnum(PortalSplitMediaPosition, { message: i18n('validation.enum') })
  @ApiPropertyOptional({ enum: PortalSplitMediaPosition, nullable: true })
  declare splitMediaPosition: PortalSplitMediaPosition | null;

  @IsArray({ message: i18n('validation.array') })
  @Type(() => PortalTranslationRequestDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [PortalTranslationRequestDto] })
  declare translations: PortalTranslationRequestDto[];

  @IsArray({ message: i18n('validation.array') })
  @Type(() => PortalLoginMediaRequestDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [PortalLoginMediaRequestDto] })
  declare loginMedia: PortalLoginMediaRequestDto[];
}
