import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { ApiHttpRequest } from '@/common/types/http-context.type';
import type { I18nTranslations } from '@/i18n/translations';
import { readCookieValue } from '@/modules/identity/authentication/session/helpers/session-cookie.util';
import { SessionAuthenticationService } from '@/modules/identity/authentication/session/session-authentication.service';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(
    private readonly sessionAuthenticationService: SessionAuthenticationService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiHttpRequest>();
    const token = readCookieValue(
      request.headers.cookie,
      this.sessionAuthenticationService.cookieName,
    );

    if (!token) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    const session = await this.sessionAuthenticationService.getByToken(token);
    if (!session) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    request.session = session.session;

    return true;
  }
}
