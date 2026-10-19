import type { ActionType } from '@contenster/shared';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthenticateGuard } from '@/common/guards/authenticate.guard';
import { RequirePermissionGuard } from '@/common/guards/require-permission.guard';

export const REQUIRED_PERMISSION_METADATA_KEY = 'required-permission';

export interface RequiredPermission {
  functionalitySlug: string;
  action: ActionType;
}

export const RequirePermission = (functionalitySlug: string, action: ActionType) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSION_METADATA_KEY, {
      functionalitySlug,
      action,
    } satisfies RequiredPermission),
    UseGuards(AuthenticateGuard, RequirePermissionGuard),
  );
