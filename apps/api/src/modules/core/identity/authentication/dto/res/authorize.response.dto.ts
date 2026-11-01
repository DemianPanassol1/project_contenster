import type { AuthorizeClientOption, AuthorizeResponse } from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class AuthorizeClientOptionResponseDto implements AuthorizeClientOption {
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

export class AuthorizeResponseDto implements AuthorizeResponse {
  @Expose()
  @Type(() => AuthorizeClientOptionResponseDto)
  @ApiProperty({ type: [AuthorizeClientOptionResponseDto] })
  declare clients: AuthorizeClientOptionResponseDto[];

  @Expose()
  @ApiProperty({ type: Boolean })
  declare isEligibleToGlobalContext: boolean;
}
