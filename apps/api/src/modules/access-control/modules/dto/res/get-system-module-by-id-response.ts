import type { GetSystemModuleByIdResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { SystemModuleListItemResponseDto } from './system-module-list-item-response.js';

class SystemModuleTranslationResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare locale: string;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare description: string | null;
}

export class GetSystemModuleByIdResponseDto
  extends SystemModuleListItemResponseDto
  implements GetSystemModuleByIdResponse
{
  @Expose()
  @Type(() => SystemModuleTranslationResponseDto)
  @ApiProperty({ type: [SystemModuleTranslationResponseDto] })
  declare translations: SystemModuleTranslationResponseDto[];
}
