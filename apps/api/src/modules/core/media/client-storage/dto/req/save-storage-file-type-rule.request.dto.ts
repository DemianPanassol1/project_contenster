import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';

import { FileType, type SaveStorageFileTypeRuleRequest } from '@contenster/shared';
import { i18n } from '@/i18n/i18n.util';
import { toBoolean, toInteger, toString } from '@/shared/transformers/dto';

export class SaveStorageFileTypeRuleRequestDto implements SaveStorageFileTypeRuleRequest {
  @Transform(toString)
  @IsEnum(FileType, { message: i18n('validation.enum') })
  @ApiProperty({ enum: FileType })
  declare fileType: FileType;

  @Transform(toInteger)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare id: number | null;

  @Transform(toBoolean)
  @IsBoolean({ message: i18n('validation.boolean') })
  @ApiProperty()
  declare isActive: boolean;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty({ type: Number })
  declare storageConfigurationId: number;
}
