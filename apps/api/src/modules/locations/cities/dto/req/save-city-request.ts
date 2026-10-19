import type { SaveCityRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import {
  toBoolean,
  toInteger,
  toLowercaseString,
  toNumber,
  toString,
} from '@/shared/transformers/dto';

class TranslationRequestDto {
  @Transform(toLowercaseString) @ApiProperty() declare locale: string;
  @Transform(toString) @ApiProperty() declare name: string;
  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}

export class SaveCityRequestDto implements SaveCityRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare stateId: number;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare ibgeCode: string | null;

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
