import type {
  SystemAdminAccessLinkClient,
  SystemAdminAccessLinkProfile,
  SystemAdminAccessLinkRequest,
  SystemAdminAccessLinkUser,
  SystemAdminAccessLinkUserDetails,
} from '@contenster/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SystemAdminAccessLinkProfileResponseDto implements SystemAdminAccessLinkProfile {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;
}

export class SystemAdminAccessLinkClientResponseDto implements SystemAdminAccessLinkClient {
  @Expose()
  @ApiProperty()
  declare document: string;

  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare isActive: boolean;

  @Expose()
  @Type(() => SystemAdminAccessLinkProfileResponseDto)
  @ApiProperty({ type: [SystemAdminAccessLinkProfileResponseDto] })
  declare profiles: SystemAdminAccessLinkProfileResponseDto[];

  @Expose()
  @ApiProperty()
  declare tradeName: string;
}

export class SystemAdminAccessLinkRequestResponseDto implements SystemAdminAccessLinkRequest {
  @Expose()
  @ApiProperty()
  declare clientId: number;

  @Expose()
  @ApiProperty()
  declare profileId: number;
}

export class SystemAdminAccessLinkUserResponseDto implements SystemAdminAccessLinkUser {
  @Expose()
  @ApiProperty()
  declare id: number;

  @Expose()
  @ApiProperty()
  declare isSuperuser: boolean;

  @Expose()
  @ApiProperty()
  declare name: string;

  @Expose()
  @ApiProperty()
  declare username: string;
}

export class SystemAdminAccessLinkUserDetailsResponseDto implements SystemAdminAccessLinkUserDetails {
  @Expose()
  @Type(() => SystemAdminAccessLinkClientResponseDto)
  @ApiProperty({ type: [SystemAdminAccessLinkClientResponseDto] })
  declare clients: SystemAdminAccessLinkClientResponseDto[];

  @Expose()
  @Type(() => SystemAdminAccessLinkRequestResponseDto)
  @ApiProperty({ type: [SystemAdminAccessLinkRequestResponseDto] })
  declare links: SystemAdminAccessLinkRequestResponseDto[];

  @Expose()
  @Type(() => SystemAdminAccessLinkUserResponseDto)
  @ApiProperty({ type: SystemAdminAccessLinkUserResponseDto })
  declare user: SystemAdminAccessLinkUserResponseDto;
}
