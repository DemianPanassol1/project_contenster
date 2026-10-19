import type { LanguageListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LanguageListItemResponseDto implements LanguageListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiProperty()
  declare languageCode: string;

  @Expose()
  @ApiProperty()
  declare regionCode: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare iconId: number | null;
}
