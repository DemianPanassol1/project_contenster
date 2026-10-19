import type { SaveProfilePermissionRequest } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toInteger, toNumber } from '@/shared/transformers/dto';

export class SaveProfilePermissionRequestDto implements SaveProfilePermissionRequest {
  @Transform(toNumber)
  @IsOptional()
  @IsInt({ message: i18n('validation.integer') })
  @ApiPropertyOptional({ nullable: true })
  declare id: number | null;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare profileId: number;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare functionalityId: number;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @ApiProperty()
  declare actionId: number;
}
