import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { type StorageConfigurationDetail, StorageProvider } from '@contenster/shared';

export class StorageConfigurationDetailResponseDto implements StorageConfigurationDetail {
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare accountId: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare bucketName: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare endpoint: string | null;

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
  @ApiPropertyOptional({ nullable: true })
  declare projectId: string | null;

  @Expose()
  @ApiProperty({ enum: StorageProvider })
  declare provider: StorageProvider;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare publicBaseUrl: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Number })
  declare signedUrlExpiresInSeconds: number | null;

  @Expose()
  @ApiProperty()
  declare useSignedUrls: boolean;
}
