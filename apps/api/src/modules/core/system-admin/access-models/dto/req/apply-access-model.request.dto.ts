import type { ApplyAccessModelRequest } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayUnique, IsArray, IsNotEmpty, IsString, Length } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toString } from '@/shared/transformers/dto';

import { PreviewAccessModelRequestDto } from './preview-access-model.request.dto';

export class ApplyAccessModelRequestDto
  extends PreviewAccessModelRequestDto
  implements ApplyAccessModelRequest
{
  @Transform(toString)
  @IsNotEmpty({ message: i18n('validation.required') })
  @Length(64, 64, { message: i18n('validation.string') })
  @ApiProperty()
  declare fingerprint: string;

  @IsArray({ message: i18n('validation.array') })
  @ArrayUnique({ message: i18n('validation.array') })
  @IsString({ each: true, message: i18n('validation.string') })
  @ApiProperty({ type: [String] })
  declare selectedChangeIds: string[];
}
