export const AUTH_ROUTES = {
  GET_AVAILABLE_CLIENTS: 'auth/available-clients',
  GET_SESSION: 'auth/session',
  POST_AUTHORIZE: 'auth/authorize',
  POST_FORGOT_PASSWORD: 'auth/forgot-password',
  POST_RESET_PASSWORD: 'auth/reset-password',
  POST_SIGN_IN: 'auth/sign-in',
  POST_SIGN_IN_GLOBAL: 'auth/sign-in-global',
  POST_SIGN_OUT: 'auth/sign-out',
  POST_SWITCH_CLIENT: 'auth/switch-client',
  POST_SWITCH_CLIENT_AS_SUPERUSER: 'auth/switch-client-as-superuser',
  POST_SWITCH_GLOBAL: 'auth/switch-global',
} as const;
