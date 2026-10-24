import type {
  ReplaceSystemAdminAccessLinksRequest,
  SystemAdminAccessLinkRequest,
} from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

import { i18n } from '@/i18n/i18n.util';
import { toInteger } from '@/shared/transformers/dto';

export class SystemAdminAccessLinkRequestDto implements SystemAdminAccessLinkRequest {
  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiProperty({ type: Number })
  declare clientId: number;

  @Transform(toInteger)
  @IsInt({ message: i18n('validation.integer') })
  @Min(1, { message: i18n('validation.min') })
  @ApiProperty({ type: Number })
  declare profileId: number;
}

export class ReplaceUserAccessLinksRequestDto implements ReplaceSystemAdminAccessLinksRequest {
  @IsArray({ message: i18n('validation.array') })
  @ValidateNested({ each: true })
  @Type(() => SystemAdminAccessLinkRequestDto)
  @ApiProperty({ type: [SystemAdminAccessLinkRequestDto] })
  declare links: SystemAdminAccessLinkRequestDto[];
}
