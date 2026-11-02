import type { SaveAccessModelRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toBoolean, toInteger, toLowercaseString, toString } from '@/shared/transformers/dto';

class AccessModelTranslationRequestDto {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  declare id: number | null;

  @Transform(toLowercaseString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  declare locale: string;

  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @IsString({ message: i18n('validation.string') })
  declare name: string;

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  declare description: string | null;
}

export class SaveAccessModelRequestDto implements SaveAccessModelRequest {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => AccessModelTranslationRequestDto)
  @ApiProperty({ type: [AccessModelTranslationRequestDto] })
  declare translations: AccessModelTranslationRequestDto[];

  @IsObject({ message: i18n('validation.array') })
  @ApiProperty({ type: Object })
  declare structure: SaveAccessModelRequest['structure'];
}
