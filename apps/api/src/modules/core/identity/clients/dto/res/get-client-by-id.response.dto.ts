import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { DocumentType, type GetClientByIdResponse } from '@contenster/shared';

import { ClientListItemResponseDto } from './client-list-item.response.dto.js';

class ClientLanguageResponseDto {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare languageId: number;
}

export class GetClientByIdResponseDto
  extends ClientListItemResponseDto
  implements GetClientByIdResponse
{
  @Expose()
  @ApiProperty({ enum: DocumentType })
  declare documentType: DocumentType;

  @Expose()
  @ApiProperty()
  declare email: string;

  @Expose()
  @ApiProperty()
  declare primaryPhone: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare secondaryPhone: string | null;

  @Expose()
  @ApiProperty()
  declare address: string;

  @Expose()
  @ApiProperty()
  declare addressNumber: string;

  @Expose()
  @ApiProperty()
  declare zipCode: string;

  @Expose()
  @ApiProperty()
  declare neighborhood: string;

  @Expose()
  @ApiProperty()
  declare slug: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare cityId: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  declare imageId: number | null;

  @Expose()
  @Type(() => ClientLanguageResponseDto)
  @ApiProperty({ type: [ClientLanguageResponseDto] })
  declare languageLinks: ClientLanguageResponseDto[];
}
