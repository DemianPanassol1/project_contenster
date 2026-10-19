import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { ApiHttpRequest } from '@/common/types/http-context.type';
import { readCookieValue } from '@/modules/identity/authentication/session/helpers/session-cookie.util';
import { SessionAuthenticationService } from '@/modules/identity/authentication/session/session-authentication.service';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(private readonly sessionAuthenticationService: SessionAuthenticationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiHttpRequest>();
    const token = readCookieValue(
      request.headers.cookie,
      this.sessionAuthenticationService.cookieName,
    );

    if (!token) throw new UnauthorizedException();

    const session = await this.sessionAuthenticationService.getByToken(token);
    if (!session) throw new UnauthorizedException();

    request.session = session.session;

    return true;
  }
}
