import { ConsoleLogger, type LogLevel } from '@nestjs/common';

import { settings } from '@/infrastructure/config/app.config';

const levelsByMinimumLevel: Record<typeof settings.LOG_LEVEL, LogLevel[]> = {
  debug: ['debug', 'log', 'warn', 'error'],
  info: ['log', 'warn', 'error'],
  log: ['log', 'warn', 'error'],
  warn: ['warn', 'error'],
  error: ['error'],
};

export const getNestLoggerLevels = (): LogLevel[] => levelsByMinimumLevel[settings.LOG_LEVEL];

export const createAppLogger = (): ConsoleLogger =>
  new ConsoleLogger(settings.APP_NAME, {
    colors: settings.LOG_PRETTY,
    json: !settings.LOG_PRETTY,
    logLevels: getNestLoggerLevels(),
    timestamp: settings.LOG_PRETTY,
  });
