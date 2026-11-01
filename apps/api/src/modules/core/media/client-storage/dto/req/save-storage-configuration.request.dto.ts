import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { type SaveStorageConfigurationRequest, StorageProvider } from '@contenster/shared';
import { i18n } from '@/i18n/i18n.util';
import { toBoolean, toInteger, toString } from '@/shared/transformers/dto';

export class SaveStorageConfigurationRequestDto implements SaveStorageConfigurationRequest {
  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare accountId: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare accessKeyId: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare bucketName: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(255, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare clientEmail: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(255, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare endpoint: string | null;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare id: number | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare identifier: string | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @MaxLength(100, { message: i18n('validation.max_length') })
  @ApiProperty()
  declare name: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(255, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare privateKey: string | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(150, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare projectId: string | null;

  @Transform(toString)
  @IsEnum(StorageProvider, { message: i18n('validation.enum') })
  @ApiProperty({ enum: StorageProvider })
  declare provider: StorageProvider;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(255, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare publicBaseUrl: string | null;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare signedUrlExpiresInSeconds: number | null;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @MaxLength(255, { message: i18n('validation.max_length') })
  @ApiPropertyOptional({ nullable: true })
  declare secretAccessKey: string | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare useSignedUrls: boolean;
}
