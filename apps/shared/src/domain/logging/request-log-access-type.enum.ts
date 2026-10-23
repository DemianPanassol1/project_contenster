export enum RequestLogAccessType {
  client = 'client',
  superuser = 'superuser',
}

export const requestLogAccessTypeDictionary = {
  [RequestLogAccessType.client]: 'enums.request_log_access_type.client',
  [RequestLogAccessType.superuser]: 'enums.request_log_access_type.superuser',
} as const satisfies Record<RequestLogAccessType, string>;
