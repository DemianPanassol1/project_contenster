import { ADMIN_ROUTES } from './admin/admin.route';
import { AUTH_ROUTES } from './auth/auth.route';
import { PUBLIC_ROUTES } from './public/public.route';
import { SYSTEM_ADMIN_ROUTES } from './system-admin/system-admin.route';

export const API_ROUTES = {
  ADMIN: ADMIN_ROUTES,
  AUTH: AUTH_ROUTES,
  PUBLIC: PUBLIC_ROUTES,
  SYSTEM_ADMIN: SYSTEM_ADMIN_ROUTES,
} as const;
