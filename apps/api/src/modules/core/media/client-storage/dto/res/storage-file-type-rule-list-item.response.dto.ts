import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { FileType, type StorageFileTypeRuleListItem } from '@contenster/shared';

export class StorageFileTypeRuleListItemResponseDto implements StorageFileTypeRuleListItem {
  @Expose()
  @ApiProperty({ enum: FileType })
  declare fileType: FileType;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare storageConfigurationId: number;

  @Expose()
  @ApiProperty()
  declare storageConfigurationName: string;
}
