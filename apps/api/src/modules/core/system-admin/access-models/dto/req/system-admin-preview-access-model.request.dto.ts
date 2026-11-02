import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toInteger } from '@/shared/transformers/dto';

import { PreviewAccessModelRequestDto } from './preview-access-model.request.dto';

export class SystemAdminPreviewAccessModelRequestDto extends PreviewAccessModelRequestDto {
  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.integer') })
  @ApiProperty()
  declare clientId: number;
}
