export const ADMIN_ROUTES = {
  DELETE_SYSTEM_MODULES: 'modules/delete',
  GET_SYSTEM_MODULE: (id: string | number) => `modules/${id}`,
  POST_CURRENT_USER_PASSWORD: 'users/me/password',
  POST_SYSTEM_MODULE: 'modules',
  POST_SYSTEM_MODULE_LIST: 'modules/list',
} as const;
