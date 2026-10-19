import type { SessionResponse } from '@contenster/shared';
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';

import { Authenticate } from '@/common/decorators/authenticate.decorator';
import { CurrentSession } from '@/common/decorators/current-session.decorator';
import type { ApiHttpRequest } from '@/common/types/http-context.type';

import { AuthorizeRequestDto } from './dto/req/authorize-request.dto';
import { SignInRequestDto } from './dto/req/sign-in-request.dto';
import { SwitchClientRequestDto } from './dto/req/switch-client-request.dto';
import { SessionAuthenticationService } from './session/session-authentication.service';
import { SessionSynchronizationService } from './session/session-synchronization.service';
import { CookieResponse } from './types/cookie-response.type';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
    private readonly sessionSynchronizationService: SessionSynchronizationService,
  ) {}

  @Post('authorize')
  authorize(@Body() request: AuthorizeRequestDto) {
    return this.authenticationService.authorize(request);
  }

  @Post('sign-in')
  async signIn(
    @Body() request: SignInRequestDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponse> {
    const result = await this.authenticationService.signIn(request);
    response.cookie(
      this.sessionAuthenticationService.cookieName,
      result.token,
      this.sessionAuthenticationService.cookieOptions(result.ttlSeconds),
    );

    return result.response;
  }

  @Get('session')
  @Authenticate()
  session(@CurrentSession() session: SessionResponse['session']): SessionResponse['session'] {
    return session;
  }

  @Post('switch-client')
  @Authenticate()
  async switchClient(
    @CurrentSession() session: SessionResponse['session'],
    @Body() request: SwitchClientRequestDto,
    @Req() httpRequest: ApiHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponse> {
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

  @Post('sign-out')
  @Authenticate()
  async signOut(
    @Req() request: ApiHttpRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<void> {
    await this.authenticationService.signOut(request.headers.cookie);

    response.clearCookie(
      this.sessionAuthenticationService.cookieName,
      this.sessionAuthenticationService.clearCookieOptions(),
    );
  }

  @Post('session/sync')
  @Authenticate()
  async synchronize(
    @Req() request: ApiHttpRequest,
  ): Promise<SessionResponse & { sessionChanged: boolean }> {
    const result = await this.sessionSynchronizationService.synchronize(request.headers.cookie);

    return { ...result.response, sessionChanged: result.sessionChanged };
  }
}
