import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ActionType, type SaveActionRequest } from '@contenster/shared';
import { i18n } from '@/i18n/i18n.util';
import { toLowercaseString, toNumber, toString } from '@/shared/transformers/dto';

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

  @Transform(toString)
  @IsOptional()
  @IsString({ message: i18n('validation.string') })
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}

export class SaveActionRequestDto implements SaveActionRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @IsEnum(ActionType, { message: i18n('validation.enum') })
  @ApiProperty({ enum: ActionType })
  declare type: ActionType;

  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => TranslationRequestDto)
  @ApiProperty({ type: [TranslationRequestDto] })
  declare translations: TranslationRequestDto[];
}
