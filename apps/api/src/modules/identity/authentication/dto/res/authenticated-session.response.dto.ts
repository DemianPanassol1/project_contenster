import type {
  AuthenticatedSession,
  SessionAction,
  SessionClient,
  SessionFunctionality,
  SessionLanguage,
  SessionModule,
  SessionProfile,
  SessionUser,
} from '@contenster/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SessionUserResponseDto implements SessionUser {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: Boolean })
  declare isSuperuser: boolean;

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;

  @Expose()
  @ApiProperty({ type: String })
  declare username: string;

  @Expose()
  @ApiProperty({ type: String })
  declare email: string;
}

export class SessionLanguageResponseDto implements SessionLanguage {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: String })
  declare languageCode: string;

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;
}

export class SessionClientResponseDto implements SessionClient {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;

  @Expose()
  @Type(() => SessionLanguageResponseDto)
  @ApiProperty({ type: [SessionLanguageResponseDto] })
  declare languages: SessionLanguageResponseDto[];
}

export class SessionProfileResponseDto implements SessionProfile {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: String })
  declare description: string | null;
}

export class SessionActionResponseDto implements SessionAction {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: String })
  declare type: SessionAction['type'];

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: String })
  declare description: string | null;
}

export class SessionFunctionalityResponseDto implements SessionFunctionality {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: String })
  declare slug: string;

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: String })
  declare description: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: String })
  declare icon: string | null;

  @Expose()
  @ApiProperty({ type: Number })
  declare order: number;

  @Expose()
  @ApiProperty({ type: Boolean })
  declare isNavigationGroup: boolean;

  @Expose()
  @Type(() => SessionActionResponseDto)
  @ApiProperty({ type: [SessionActionResponseDto] })
  declare actions: SessionActionResponseDto[];

  @Expose()
  @Type(() => SessionFunctionalityResponseDto)
  @ApiProperty({ type: [SessionFunctionalityResponseDto] })
  declare children: SessionFunctionalityResponseDto[];
}

export class SessionModuleResponseDto implements SessionModule {
  @Expose()
  @ApiProperty({ type: Number })
  declare id: number;

  @Expose()
  @ApiProperty({ type: String })
  declare name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true, type: String })
  declare description: string | null;

  @Expose()
  @ApiProperty({ type: Number })
  declare order: number;

  @Expose()
  @Type(() => SessionFunctionalityResponseDto)
  @ApiProperty({ type: [SessionFunctionalityResponseDto] })
  declare functionalities: SessionFunctionalityResponseDto[];
}

export class AuthenticatedSessionResponseDto implements AuthenticatedSession {
  @Expose()
  @Type(() => SessionUserResponseDto)
  @ApiProperty({ type: SessionUserResponseDto })
  declare user: SessionUserResponseDto;

  @Expose()
  @ApiProperty({ type: Object })
  declare context: AuthenticatedSession['context'];

  @Expose()
  @Type(() => SessionModuleResponseDto)
  @ApiProperty({ type: [SessionModuleResponseDto] })
  declare modules: SessionModuleResponseDto[];
}
