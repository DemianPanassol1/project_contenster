import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { FileType, StorageProvider, type SystemAdminFileListItem } from '@contenster/shared';

export class SystemAdminFileListItemResponseDto implements SystemAdminFileListItem {
  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare clientId: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare clientName: string | null;

  @Expose()
  @ApiProperty()
  declare createdAt: string;

  @Expose()
  @ApiProperty({ enum: FileType })
  declare fileType: FileType;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare mimeType: string;

  @Expose()
  @ApiProperty()
  declare originalName: string;

  @Expose()
  @ApiProperty({ enum: StorageProvider })
  declare provider: StorageProvider;

  @Expose()
  @ApiProperty()
  declare sizeInBytes: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare uploadedByName: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare url: string | null;
}
