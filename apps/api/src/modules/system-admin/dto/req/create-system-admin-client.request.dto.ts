import type {
  CreateSystemAdminClientRequest,
  SystemAdminFunctionalityProvisionRequest,
  SystemAdminModuleProvisionRequest,
  SystemAdminTranslationRequest,
} from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { SaveClientRequestDto } from '@/modules/identity/clients/dto/req/save-client.request.dto';
import { toBoolean, toInteger, toLowercaseString, toString } from '@/shared/transformers/dto';

class SystemAdminTranslationRequestDto implements SystemAdminTranslationRequest {
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

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}

class SystemAdminModuleProvisionRequestDto implements SystemAdminModuleProvisionRequest {
  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare key: string;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare order: number;

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminTranslationRequestDto)
  @ApiProperty({ type: [SystemAdminTranslationRequestDto] })
  declare translations: SystemAdminTranslationRequestDto[];
}

class SystemAdminFunctionalityProvisionRequestDto implements SystemAdminFunctionalityProvisionRequest {
  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare moduleKey: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare parentSlug: string | null;

  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare slug: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare icon: string | null;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare order: number;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isNavigationGroup: boolean;

  @IsArray({ message: i18n('validation.array') })
  @Type(() => Number)
  @IsInt({ each: true, message: i18n('validation.integer') })
  @ApiProperty({ type: [Number] })
  declare languageIds: number[];

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminTranslationRequestDto)
  @ApiProperty({ type: [SystemAdminTranslationRequestDto] })
  declare translations: SystemAdminTranslationRequestDto[];
}

class SystemAdminProfileProvisionRequestDto {
  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminTranslationRequestDto)
  @ApiProperty({ type: [SystemAdminTranslationRequestDto] })
  declare translations: SystemAdminTranslationRequestDto[];
}

export class CreateSystemAdminClientRequestDto implements CreateSystemAdminClientRequest {
  @ValidateNested()
  @Type(() => SaveClientRequestDto)
  @ApiProperty({ type: SaveClientRequestDto })
  declare client: SaveClientRequestDto;

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminModuleProvisionRequestDto)
  @ApiProperty({ type: [SystemAdminModuleProvisionRequestDto] })
  declare modules: SystemAdminModuleProvisionRequestDto[];

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminFunctionalityProvisionRequestDto)
  @ApiProperty({ type: [SystemAdminFunctionalityProvisionRequestDto] })
  declare functionalities: SystemAdminFunctionalityProvisionRequestDto[];

  @ValidateNested()
  @Type(() => SystemAdminProfileProvisionRequestDto)
  @ApiProperty({ type: SystemAdminProfileProvisionRequestDto })
  declare adminProfile: SystemAdminProfileProvisionRequestDto;
}
