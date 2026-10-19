export enum RequestLogLevel {
  info = 'info',
  warning = 'warning',
  error = 'error',
  fatal = 'fatal',
}

export const requestLogLevelDictionary = {
  [RequestLogLevel.info]: 'enums.request_log_level.info',
  [RequestLogLevel.warning]: 'enums.request_log_level.warning',
  [RequestLogLevel.error]: 'enums.request_log_level.error',
  [RequestLogLevel.fatal]: 'enums.request_log_level.fatal',
} as const satisfies Record<RequestLogLevel, string>;
