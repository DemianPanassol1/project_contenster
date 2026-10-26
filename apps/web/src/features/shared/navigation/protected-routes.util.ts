import type { ActionType } from '@contenster/shared';

import type { ProtectedRouteId, ProtectedRouteSlug } from './protected-routes.type';

const ADMIN_BASE_PATH = '/admin';

export const parseIdParam = (value: string): number | null => {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
};

export const functionalityRouteSegment = (slug: ProtectedRouteSlug): string =>
  encodeURIComponent(slug);

export const crudListPath = (slug: ProtectedRouteSlug): string =>
  `${ADMIN_BASE_PATH}/${functionalityRouteSegment(slug)}`;

export const crudCreatePath = (slug: ProtectedRouteSlug): string => `${crudListPath(slug)}/create`;

export const crudUpdatePath = (slug: ProtectedRouteSlug, id: ProtectedRouteId): string =>
  `${crudListPath(slug)}/update/${encodeURIComponent(String(id))}`;

export const hasPermissionAction = (actions: readonly ActionType[], action: ActionType): boolean =>
  actions.includes(action);
