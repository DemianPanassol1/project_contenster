export const SYSTEM_ADMIN_ROUTES = {
  DELETE_CLIENT: (id: number) => `system-admin/clients/${id}`,
  PATCH_CLIENT_ACTIVE: (id: number) => `system-admin/clients/${id}/active`,
  POST_CLIENT_LIST: 'system-admin/clients/list',
} as const;
