import type { ActionType, FunctionalitySlug } from '@contenster/shared';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { AuthenticateGuard } from '@/common/guards/authenticate.guard';
import { RequirePermissionGuard } from '@/common/guards/require-permission.guard';

export const REQUIRED_PERMISSION_METADATA_KEY = 'required-permission';

export interface RequirePermissionOptions {
  bodyIdField?: string;
  updateActionType?: ActionType;
}

export interface RequiredPermission {
  action: ActionType;
  functionalitySlug: FunctionalitySlug;
  options: RequirePermissionOptions;
}

export const RequirePermission = (
  functionalitySlug: FunctionalitySlug,
  action: ActionType,
  options: RequirePermissionOptions = {},
) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSION_METADATA_KEY, {
      action,
      functionalitySlug,
      options,
    } satisfies RequiredPermission),
    UseGuards(AuthenticateGuard, RequirePermissionGuard),
  );
