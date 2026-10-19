import type { ActionType } from '@contenster/shared';
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
    if (!request.session) {
      throw new ForbiddenException();
    }

    const hasPermission = this.authorizationResolver.hasPermission(request.session, {
      action: this.resolveAction(request, permission),
      functionalitySlug: permission.functionalitySlug,
    });

    if (!hasPermission) {
      throw new ForbiddenException();
    }

    return true;
  }

  private resolveAction(request: ApiHttpRequest, permission: RequiredPermission): ActionType {
    const { bodyIdField, updateActionType } = permission.options;

    if (!bodyIdField || !updateActionType || !this.hasPositiveRecordId(request.body, bodyIdField)) {
      return permission.action;
    }

    return updateActionType;
  }

  private hasPositiveRecordId(body: unknown, field: string): boolean {
    if (!body || typeof body !== 'object') return false;

    const value = (body as Record<string, unknown>)[field];
    const id = typeof value === 'number' ? value : Number(value);

    return Number.isSafeInteger(id) && id > 0;
  }
}
