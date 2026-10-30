export const SYSTEM_ADMIN_ROUTES = {
  DELETE_CLIENT: (id: number) => `system-admin/clients/${id}`,
  PATCH_CLIENT_ACTIVE: (id: number) => `system-admin/clients/${id}/active`,
  POST_CLIENT_LIST: 'system-admin/clients/list',
  GET_REQUEST_LOG: (id: number) => `system-admin/request-logs/${id}`,
  GET_JOB_LOG: (id: number) => `system-admin/job-logs/${id}`,
  POST_REQUEST_LOG_CLIENT_OPTIONS: 'system-admin/request-logs/client-options',
  POST_REQUEST_LOG_LIST: 'system-admin/request-logs/list',
  POST_JOB_LOG_LIST: 'system-admin/job-logs/list',
} as const;
