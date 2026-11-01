import type { AuthorizeClientOption, AvailableClientsResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class AvailableClientOptionResponseDto implements AuthorizeClientOption {
  @Expose()
  @ApiProperty({ type: String })
  declare label: string;

  @Expose()
  @ApiProperty({ type: Number })
  declare value: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Boolean })
  declare disabled: boolean | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: Object })
  declare metadata: Record<string, unknown> | null;
}

export class AvailableClientsResponseDto implements AvailableClientsResponse {
  @Expose()
  @Type(() => AvailableClientOptionResponseDto)
  @ApiProperty({ type: [AvailableClientOptionResponseDto] })
  declare clients: AvailableClientOptionResponseDto[];
}
