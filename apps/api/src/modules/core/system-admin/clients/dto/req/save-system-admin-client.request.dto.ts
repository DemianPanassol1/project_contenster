import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  FileType,
  type SaveClientRequest,
  type SaveSystemAdminClientRequest,
  type SystemAdminClientStorageConfigurationRequest,
  type SystemAdminClientStorageRuleRequest,
  type SystemAdminTranslationRequest,
} from '@contenster/shared';
import { i18n } from '@/i18n/i18n.util';
import { SaveClientRequestDto } from '@/modules/core/identity/clients/dto/req/save-client.request.dto';
import { SaveStorageConfigurationRequestDto } from '@/modules/core/media/client-storage/dto/req/save-storage-configuration.request.dto';
import { toBoolean, toInteger, toLowercaseString } from '@/shared/transformers/dto';

class SystemAdminTranslationRequestDto implements SystemAdminTranslationRequest {
  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare locale: string;

  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare name: string;

  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}

class SystemAdminClientStorageConfigurationRequestDto
  extends SaveStorageConfigurationRequestDto
  implements SystemAdminClientStorageConfigurationRequest
{
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare key: string;
}

class SystemAdminClientStorageRuleRequestDto implements SystemAdminClientStorageRuleRequest {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare id: number | null;

  @IsEnum(FileType, { message: i18n('validation.enum') })
  @ApiProperty({ enum: FileType })
  declare fileType: FileType;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare storageConfigurationKey: string;
}

class SystemAdminClientStorageRequestDto {
  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminClientStorageConfigurationRequestDto)
  @ApiProperty({ type: [SystemAdminClientStorageConfigurationRequestDto] })
  declare configurations: SystemAdminClientStorageConfigurationRequestDto[];

  @IsArray({ message: i18n('validation.array') })
  @Type(() => Number)
  @IsInt({ each: true, message: i18n('validation.integer') })
  @ApiProperty({ type: [Number] })
  declare deletedConfigurationIds: number[];

  @IsArray({ message: i18n('validation.array') })
  @Type(() => Number)
  @IsInt({ each: true, message: i18n('validation.integer') })
  @ApiProperty({ type: [Number] })
  declare deletedRuleIds: number[];

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminClientStorageRuleRequestDto)
  @ApiProperty({ type: [SystemAdminClientStorageRuleRequestDto] })
  declare rules: SystemAdminClientStorageRuleRequestDto[];
}

class SystemAdminProfileRequestDto {
  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminTranslationRequestDto)
  @ApiProperty({ type: [SystemAdminTranslationRequestDto] })
  declare translations: SystemAdminTranslationRequestDto[];
}

class SystemAdminClientRequestDto
  extends OmitType(SaveClientRequestDto, ['slug'] as const)
  implements Omit<SaveClientRequest, 'slug'> {}

export class SaveSystemAdminClientRequestDto implements SaveSystemAdminClientRequest {
  @ValidateNested()
  @Type(() => SystemAdminClientRequestDto)
  @ApiProperty({ type: SystemAdminClientRequestDto })
  declare client: SystemAdminClientRequestDto;

  @ValidateNested()
  @Type(() => SystemAdminProfileRequestDto)
  @ApiProperty({ type: SystemAdminProfileRequestDto })
  declare adminProfile: SystemAdminProfileRequestDto;

  @ValidateNested()
  @Type(() => SystemAdminClientStorageRequestDto)
  @ApiProperty({ type: SystemAdminClientStorageRequestDto })
  declare storage: SystemAdminClientStorageRequestDto;
}
