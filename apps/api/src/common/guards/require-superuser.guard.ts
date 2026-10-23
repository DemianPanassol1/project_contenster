import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { SessionContextType } from '@contenster/shared';
import type { ApiHttpRequest } from '@/common/types/http-context.type';
import type { I18nTranslations } from '@/i18n/translations';

@Injectable()
export class RequireSuperuserGuard implements CanActivate {
  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  canActivate(context: ExecutionContext): boolean {
    const session = context.switchToHttp().getRequest<ApiHttpRequest>().session;

    if (
      !session ||
      session.context.type !== SessionContextType.global ||
      !session.user.isSuperuser
    ) {
      throw new ForbiddenException(this.i18n.t('errors.authorization.global_context_required'));
    }

    return true;
  }
}
