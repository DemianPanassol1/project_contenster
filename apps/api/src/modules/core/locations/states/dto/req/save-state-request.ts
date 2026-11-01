import type { SaveStateRequest } from '@contenster/shared';
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
import {
  toBoolean,
  toInteger,
  toLowercaseString,
  toNumber,
  toString,
  toUppercaseString,
} from '@/shared/transformers/dto';

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

export class SaveStateRequestDto implements SaveStateRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare countryId: number;

  @Transform(toUppercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  @ApiProperty()
  declare code: string;

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
