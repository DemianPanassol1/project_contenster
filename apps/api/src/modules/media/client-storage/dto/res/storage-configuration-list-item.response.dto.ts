import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type StorageConfigurationListItem, StorageProvider } from '@contenster/shared';

export class StorageConfigurationListItemResponseDto implements StorageConfigurationListItem {
  @Expose()
  @ApiProperty()
  declare hasCredential: boolean;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare identifier: string | null;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiProperty({ enum: StorageProvider })
  declare provider: StorageProvider;
}
