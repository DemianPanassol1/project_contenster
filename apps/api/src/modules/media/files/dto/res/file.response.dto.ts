import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type FileResponse, FileType, StorageProvider } from '@contenster/shared';

export class FileResponseDto implements FileResponse {
  @Expose()
  @ApiProperty()
  declare clientId: number;

  @Expose()
  @ApiProperty({ format: 'date-time', type: String })
  declare createdAt: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare extension: string | null;

  @Expose()
  @ApiProperty()
  declare fileName: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare height: number | null;

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
  declare size: number;

  @Expose()
  @ApiProperty({ enum: FileType })
  declare type: FileType;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare uploadedByUserId: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare url: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare width: number | null;
}
