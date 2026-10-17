import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  Validate,
  ValidateIf,
} from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { DeleteRecordsRequestConstraint } from '@/shared/dtos/validators/delete-records-request.validator';
import { toInteger, toNumberArray } from '@/shared/transformers/dto';

export class DeleteRecordsRequestDto {
  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiPropertyOptional({ type: Number, nullable: true })
  id: number | null = null;

  @Transform(toNumberArray)
  @ValidateIf((_object, value: number[]) => value.length > 0)
  @IsArray({ message: i18n('validation.array') })
  @ArrayNotEmpty({ message: i18n('validation.required') })
  @ArrayUnique({ message: i18n('validation.enum') })
  @IsInt({ each: true, message: i18n('validation.integer') })
  @Min(1, { each: true, message: i18n('validation.min') })
  @ApiPropertyOptional({ type: [Number] })
  ids: number[] = [];

  @Validate(DeleteRecordsRequestConstraint, { message: i18n('validation.invalid_delete_request') })
  @ApiHideProperty()
  deleteRequest = false;
}
