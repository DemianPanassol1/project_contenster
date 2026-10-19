import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  REQUIRED_PERMISSION_METADATA_KEY,
  type RequiredPermission,
} from '@/common/decorators/require-permission.decorator';
import type { ApiHttpRequest } from '@/common/types/http-context.type';
import { AuthorizationResolverService } from '@/modules/authorization/authorization-resolver.service';

@Injectable()
export class RequirePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationResolver: AuthorizationResolverService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRED_PERMISSION_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest<ApiHttpRequest>();
    if (
      !request.session ||
      !this.authorizationResolver.hasPermission(request.session, permission)
    ) {
      throw new ForbiddenException();
    }

    return true;
  }
}
