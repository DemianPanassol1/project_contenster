import type { ClientListItem } from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
export class ClientListItemResponseDto implements ClientListItem {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare corporateName: string;

  @Expose()
  @ApiProperty()
  declare tradeName: string;

  @Expose()
  @ApiProperty()
  declare document: string;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;
}
