import type { DocumentType, SystemAdminClientListItem } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SystemAdminClientListItemResponseDto implements SystemAdminClientListItem {
  @Expose()
  @ApiProperty()
  declare corporateName: string;

  @Expose()
  @ApiProperty()
  declare document: string;

  @Expose()
  @ApiProperty()
  declare documentType: DocumentType;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare imageUrl: string | null;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare tradeName: string;

  @Expose()
  @ApiProperty()
  declare userCount: number;
}
