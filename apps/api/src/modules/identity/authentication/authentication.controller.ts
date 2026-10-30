import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';

import { Authenticate } from '@/common/decorators/authenticate.decorator';
import { CurrentSession } from '@/common/decorators/current-session.decorator';
import type { ApiHttpRequest } from '@/common/types/http-context.type';

import { AuthorizeRequestDto } from './dto/req/authorize-request.dto';
import { ForgotPasswordRequestDto } from './dto/req/forgot-password-request.dto';
import { ResetPasswordRequestDto } from './dto/req/reset-password-request.dto';
import { SignInGlobalRequestDto } from './dto/req/sign-in-global-request.dto';
import { SignInRequestDto } from './dto/req/sign-in-request.dto';
import { SwitchClientRequestDto } from './dto/req/switch-client-request.dto';
import {
  AuthenticatedSessionResponseDto,
  AuthorizeResponseDto,
  AvailableClientsResponseDto,
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  SessionResponseDto,
  SignOutResponseDto,
} from './dto/res';
import { SessionAuthenticationService } from './session/session-authentication.service';
import { CookieResponse } from './types/cookie-response.type';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
  ) {}

  @Post('authorize')
  authorize(@Body() request: AuthorizeRequestDto): Promise<AuthorizeResponseDto> {
    return this.authenticationService.authorize(request);
  }

  @Get('available-clients')
  @Authenticate()
  availableClients(
    @CurrentSession() session: AuthenticatedSessionResponseDto,
  ): Promise<AvailableClientsResponseDto> {
    return this.authenticationService.availableClients(session.user.id);
  }

  @Post('sign-in-global')
  async signInGlobal(
    @Body() request: SignInGlobalRequestDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponseDto> {
    const result = await this.authenticationService.signInGlobal(
      request.staySignedIn,
      request.username,
      request.password,
    );
    response.cookie(
      this.sessionAuthenticationService.cookieName,
      result.token,
      this.sessionAuthenticationService.cookieOptions(result.ttlSeconds),
    );
    return result.response;
  }

  @Post('sign-in')
  async signIn(
    @Body() request: SignInRequestDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponseDto> {
    const result = await this.authenticationService.signIn(request);
    response.cookie(
      this.sessionAuthenticationService.cookieName,
      result.token,
      this.sessionAuthenticationService.cookieOptions(result.ttlSeconds),
    );

    return result.response;
  }

  @Post('forgot-password')
  forgotPassword(@Body() request: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
    return this.authenticationService.forgotPassword(request);
  }

  @Post('reset-password')
  resetPassword(@Body() request: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> {
    return this.authenticationService.resetPassword(request);
  }

  @Get('session')
  @Authenticate()
  session(
    @CurrentSession() session: AuthenticatedSessionResponseDto,
  ): AuthenticatedSessionResponseDto {
    return this.authenticationService.session(session);
  }

  @Post('switch-client')
  @Authenticate()
  async switchClient(
    @CurrentSession() session: AuthenticatedSessionResponseDto,
    @Body() request: SwitchClientRequestDto,
    @Req() httpRequest: ApiHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponseDto> {
    const result = await this.authenticationService.switchClient(
      request,
      session.user.id,
      httpRequest.headers.cookie,
    );

    response.cookie(
      this.sessionAuthenticationService.cookieName,
      result.token,
      this.sessionAuthenticationService.cookieOptions(result.ttlSeconds),
    );

    return result.response;
  }

  @Post('switch-client-as-superuser')
  @Authenticate()
  async switchClientAsSuperuser(
    @CurrentSession() session: AuthenticatedSessionResponseDto,
    @Body() request: SwitchClientRequestDto,
    @Req() httpRequest: ApiHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponseDto> {
    const result = await this.authenticationService.switchClientAsSuperuser(
      request,
      session.user.id,
      httpRequest.headers.cookie,
    );
    response.cookie(
      this.sessionAuthenticationService.cookieName,
      result.token,
      this.sessionAuthenticationService.cookieOptions(result.ttlSeconds),
    );
    return result.response;
  }

  @Post('switch-global')
  @Authenticate()
  async switchGlobal(
    @CurrentSession() session: AuthenticatedSessionResponseDto,
    @Req() httpRequest: ApiHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponseDto> {
    const result = await this.authenticationService.switchGlobal(
      session.user.id,
      httpRequest.headers.cookie,
    );
    response.cookie(
      this.sessionAuthenticationService.cookieName,
      result.token,
      this.sessionAuthenticationService.cookieOptions(result.ttlSeconds),
    );
    return result.response;
  }

  @Post('sign-out')
  @Authenticate()
  async signOut(
    @Req() request: ApiHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SignOutResponseDto> {
    const signedOut = await this.authenticationService.signOut(request.headers.cookie);

    response.clearCookie(
      this.sessionAuthenticationService.cookieName,
      this.sessionAuthenticationService.clearCookieOptions(),
    );

    return signedOut;
  }
}
