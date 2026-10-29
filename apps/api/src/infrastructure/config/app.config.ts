import { resolve } from 'node:path';
import dotenv from 'dotenv';

export const API_ROOT_PATH = resolve(__dirname, '..', '..', '..');
export const WORKSPACE_ROOT_PATH = resolve(API_ROOT_PATH, '..', '..');

const environmentFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: resolve(API_ROOT_PATH, environmentFile), quiet: true });

const NODE_ENVS = ['development', 'production', 'test'] as const;
const LOG_LEVELS = ['debug', 'info', 'log', 'warn', 'error'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];
export type ApiLogLevel = (typeof LOG_LEVELS)[number];

export interface AppSettings {
  NODE_ENV: NodeEnv;
  PORT: number;
  APP_NAME: string;
  APP_URL: string;
  API_PREFIX: string | null;
  API_VERSION: string | null;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_NAME: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_SSL: boolean;
  DATABASE_LOGGING: boolean;
  DATABASE_POOL_MAX: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME: string | null;
  REDIS_PASSWORD: string | null;
  REDIS_DATABASE: number;
  REDIS_TLS: boolean;
  REDIS_CONNECT_TIMEOUT_MS: number;
  REDIS_COMMAND_TIMEOUT_MS: number;
  REDIS_RECONNECT_MAX_RETRIES: number;
  REDIS_RECONNECT_BASE_DELAY_MS: number;
  REDIS_RECONNECT_MAX_DELAY_MS: number;
  REDIS_RECONNECT_COOLDOWN_MS: number;
  SESSION_HMAC_SECRET: string | null;
  SESSION_COOKIE_NAME: string;
  SESSION_KEY_PREFIX: string;
  SESSION_NORMAL_TTL_SECONDS: number;
  SESSION_REMEMBERED_TTL_SECONDS: number;
  SESSION_ACTIVITY_UPDATE_INTERVAL_SECONDS: number;
  PASSWORD_RESET_TOKEN_SECRET: string | null;
  PASSWORD_RESET_TOKEN_TTL_SECONDS: number;
  PASSWORD_RESET_TOKEN_ISSUER: string | null;
  PASSWORD_RESET_TOKEN_AUDIENCE: string | null;
  MAIL_HOST: string | null;
  MAIL_PORT: number | null;
  MAIL_SECURE: boolean;
  MAIL_USER: string | null;
  MAIL_PASSWORD: string | null;
  MAIL_FROM_NAME: string | null;
  MAIL_FROM_ADDRESS: string | null;
  CORS_ORIGIN: string[];
  CORS_METHODS: string[];
  CORS_CREDENTIALS: boolean;
  THROTTLE_TTL_MS: number;
  THROTTLE_LIMIT: number;
  SWAGGER_ENABLED: boolean;
  SWAGGER_PATH: string;
  SWAGGER_PERSIST_AUTHORIZATION: boolean;
  LOG_LEVEL: ApiLogLevel;
  LOG_PRETTY: boolean;
  MAX_UPLOAD_FILE_SIZE_BYTES: number;
  UPLOADS_LOCAL_ROOT_PATH: string;
  UPLOADS_PUBLIC_BASE_URL: string;
  STORAGE_CREDENTIALS_ENCRYPTION_KEY: string | null;
  REQUEST_LOG_RETENTION_INFO_DAYS: number;
  REQUEST_LOG_RETENTION_WARNING_DAYS: number;
  REQUEST_LOG_RETENTION_ERROR_DAYS: number;
  REQUEST_LOG_RETENTION_FATAL_DAYS: number;
  CRON_LOG_CLEANUP_CRON: string;
  CRON_LOG_RETENTION_DAYS: number;
  FILE_CLEANUP_CRON: string;
  FILE_CLEANUP_SAFETY_WINDOW_MINUTES: number;
}

const optionalString = (name: string): string | null => {
  const value = process.env[name]?.trim();

  return value || null;
};

const stringValue = (name: string, fallback: string): string => optionalString(name) ?? fallback;

const numberValue = (name: string, fallback: number): number => {
  const value = optionalString(name);

  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number value for ${name}: ${value}`);

  return parsed;
};

const nonNegativeIntegerValue = (name: string, fallback: number): number => {
  const value = numberValue(name, fallback);

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid non-negative integer value for ${name}: ${value}`);
  }

  return value;
};

const positiveIntegerValue = (name: string, fallback: number): number => {
  const value = nonNegativeIntegerValue(name, fallback);

  if (value === 0) throw new Error(`Invalid positive integer value for ${name}: ${value}`);

  return value;
};

const optionalPositiveIntegerValue = (name: string): number | null => {
  const value = optionalString(name);

  return value === null ? null : positiveIntegerValue(name, 0);
};

const durationSecondsValue = (name: string, fallback: number): number => {
  const value = optionalString(name);

  if (value === null) return fallback;

  const match = /^(\d+)([smhd])?$/.exec(value);
  if (!match) throw new Error(`Invalid duration value for ${name}: ${value}`);

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multipliers: Record<string, number> = { d: 86_400, h: 3_600, m: 60, s: 1 };
  const multiplier = multipliers[unit];

  if (multiplier === undefined) {
    throw new Error(`Invalid duration value for ${name}: ${value}`);
  }

  const seconds = amount * multiplier;

  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error(`Invalid positive duration value for ${name}: ${value}`);
  }

  return seconds;
};

const booleanValue = (name: string, fallback: boolean): boolean => {
  const value = optionalString(name);

  if (!value) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`Invalid boolean value for ${name}: ${value}`);
};

const enumValue = <TValue extends string>(
  name: string,
  allowedValues: readonly TValue[],
  fallback: TValue,
): TValue => {
  const value = optionalString(name);

  if (!value) return fallback;
  if ((allowedValues as readonly string[]).includes(value)) return value as TValue;

  throw new Error(
    `Invalid value for ${name}: ${value}. Allowed values: ${allowedValues.join(', ')}`,
  );
};

const stringList = (name: string, fallback: string[]): string[] => {
  const value = optionalString(name);

  if (!value) return fallback;

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const SECRET_PLACEHOLDER_PATTERN = /(?:^<.*>$|change-?me|replace-with)/i;

export const isValidSessionHmacSecret = (value: string | null): value is string =>
  Boolean(
    value && Buffer.byteLength(value, 'utf8') >= 32 && !SECRET_PLACEHOLDER_PATTERN.test(value),
  );

const sessionHmacSecretValue = (nodeEnv: NodeEnv): string | null => {
  const value = optionalString('SESSION_HMAC_SECRET');

  if (nodeEnv !== 'production' && !isValidSessionHmacSecret(value)) return null;
  if (!isValidSessionHmacSecret(value)) {
    throw new Error(
      'SESSION_HMAC_SECRET must contain at least 32 bytes and must not be a documented placeholder.',
    );
  }

  return value;
};

const passwordResetTokenSecretValue = (nodeEnv: NodeEnv): string | null => {
  const value = optionalString('PASSWORD_RESET_TOKEN_SECRET');

  if (nodeEnv !== 'production' && !isValidSessionHmacSecret(value)) return null;
  if (!isValidSessionHmacSecret(value)) {
    throw new Error(
      'PASSWORD_RESET_TOKEN_SECRET must contain at least 32 bytes and must not be a documented placeholder.',
    );
  }

  if (value === optionalString('SESSION_HMAC_SECRET')) {
    throw new Error('PASSWORD_RESET_TOKEN_SECRET must not reuse SESSION_HMAC_SECRET.');
  }

  return value;
};

const storageCredentialsEncryptionKeyValue = (nodeEnv: NodeEnv): string | null => {
  const value = optionalString('STORAGE_CREDENTIALS_ENCRYPTION_KEY');

  if (!value && nodeEnv !== 'production') return null;
  if (!value) {
    throw new Error('STORAGE_CREDENTIALS_ENCRYPTION_KEY must be configured in production.');
  }

  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) {
    throw new Error('STORAGE_CREDENTIALS_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  }

  return value;
};

const nodeEnv = enumValue('NODE_ENV', NODE_ENVS, 'development');

export const settings: AppSettings = {
  NODE_ENV: nodeEnv,
  PORT: positiveIntegerValue('PORT', 8080),
  APP_NAME: stringValue('APP_NAME', 'Contenster Slim Core API'),
  APP_URL: stringValue('APP_URL', 'http://localhost:5000'),
  API_PREFIX: optionalString('API_PREFIX'),
  API_VERSION: optionalString('API_VERSION'),
  DATABASE_HOST: stringValue('DATABASE_HOST', 'localhost'),
  DATABASE_PORT: positiveIntegerValue('DATABASE_PORT', 5432),
  DATABASE_NAME: stringValue('DATABASE_NAME', 'contenster_slim_core'),
  DATABASE_USER: stringValue('DATABASE_USER', 'postgres'),
  DATABASE_PASSWORD: stringValue('DATABASE_PASSWORD', ''),
  DATABASE_SSL: booleanValue('DATABASE_SSL', false),
  DATABASE_LOGGING: booleanValue('DATABASE_LOGGING', false),
  DATABASE_POOL_MAX: positiveIntegerValue('DATABASE_POOL_MAX', 10),
  REDIS_HOST: stringValue('REDIS_HOST', '127.0.0.1'),
  REDIS_PORT: positiveIntegerValue('REDIS_PORT', 6379),
  REDIS_USERNAME: optionalString('REDIS_USERNAME'),
  REDIS_PASSWORD: optionalString('REDIS_PASSWORD'),
  REDIS_DATABASE: nonNegativeIntegerValue('REDIS_DATABASE', 0),
  REDIS_TLS: booleanValue('REDIS_TLS', false),
  REDIS_CONNECT_TIMEOUT_MS: positiveIntegerValue('REDIS_CONNECT_TIMEOUT_MS', 3000),
  REDIS_COMMAND_TIMEOUT_MS: positiveIntegerValue('REDIS_COMMAND_TIMEOUT_MS', 3000),
  REDIS_RECONNECT_MAX_RETRIES: nonNegativeIntegerValue('REDIS_RECONNECT_MAX_RETRIES', 3),
  REDIS_RECONNECT_BASE_DELAY_MS: positiveIntegerValue('REDIS_RECONNECT_BASE_DELAY_MS', 100),
  REDIS_RECONNECT_MAX_DELAY_MS: positiveIntegerValue('REDIS_RECONNECT_MAX_DELAY_MS', 1000),
  REDIS_RECONNECT_COOLDOWN_MS: positiveIntegerValue('REDIS_RECONNECT_COOLDOWN_MS', 5000),
  SESSION_HMAC_SECRET: sessionHmacSecretValue(nodeEnv),
  SESSION_COOKIE_NAME: stringValue('SESSION_COOKIE_NAME', 'contenster_session'),
  SESSION_KEY_PREFIX: stringValue('SESSION_KEY_PREFIX', 'contenster:auth'),
  SESSION_NORMAL_TTL_SECONDS: positiveIntegerValue('SESSION_NORMAL_TTL_SECONDS', 3600),
  SESSION_REMEMBERED_TTL_SECONDS: positiveIntegerValue('SESSION_REMEMBERED_TTL_SECONDS', 2_592_000),
  SESSION_ACTIVITY_UPDATE_INTERVAL_SECONDS: positiveIntegerValue(
    'SESSION_ACTIVITY_UPDATE_INTERVAL_SECONDS',
    300,
  ),
  PASSWORD_RESET_TOKEN_SECRET: passwordResetTokenSecretValue(nodeEnv),
  PASSWORD_RESET_TOKEN_TTL_SECONDS: durationSecondsValue('PASSWORD_RESET_TOKEN_EXPIRES_IN', 900),
  PASSWORD_RESET_TOKEN_ISSUER: optionalString('PASSWORD_RESET_TOKEN_ISSUER'),
  PASSWORD_RESET_TOKEN_AUDIENCE: optionalString('PASSWORD_RESET_TOKEN_AUDIENCE'),
  MAIL_HOST: optionalString('MAIL_HOST'),
  MAIL_PORT: optionalPositiveIntegerValue('MAIL_PORT'),
  MAIL_SECURE: booleanValue('MAIL_SECURE', false),
  MAIL_USER: optionalString('MAIL_USER'),
  MAIL_PASSWORD: optionalString('MAIL_PASSWORD'),
  MAIL_FROM_NAME: optionalString('MAIL_FROM_NAME'),
  MAIL_FROM_ADDRESS: optionalString('MAIL_FROM_ADDRESS'),
  CORS_ORIGIN: stringList('CORS_ORIGIN', []),
  CORS_METHODS: stringList('CORS_METHODS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
  CORS_CREDENTIALS: booleanValue('CORS_CREDENTIALS', false),
  THROTTLE_TTL_MS: positiveIntegerValue('THROTTLE_TTL_MS', 60_000),
  THROTTLE_LIMIT: positiveIntegerValue('THROTTLE_LIMIT', 100),
  SWAGGER_ENABLED: booleanValue('SWAGGER_ENABLED', nodeEnv !== 'production'),
  SWAGGER_PATH: stringValue('SWAGGER_PATH', 'api/v1/docs'),
  SWAGGER_PERSIST_AUTHORIZATION: booleanValue('SWAGGER_PERSIST_AUTHORIZATION', true),
  LOG_LEVEL: enumValue('LOG_LEVEL', LOG_LEVELS, 'info'),
  LOG_PRETTY: booleanValue('LOG_PRETTY', true),
  MAX_UPLOAD_FILE_SIZE_BYTES: positiveIntegerValue('MAX_UPLOAD_FILE_SIZE_BYTES', 26_214_400),
  UPLOADS_LOCAL_ROOT_PATH: stringValue('UPLOADS_LOCAL_ROOT_PATH', 'writable/uploads'),
  UPLOADS_PUBLIC_BASE_URL: stringValue('UPLOADS_PUBLIC_BASE_URL', '/uploads'),
  STORAGE_CREDENTIALS_ENCRYPTION_KEY: storageCredentialsEncryptionKeyValue(nodeEnv),
  REQUEST_LOG_RETENTION_INFO_DAYS: nonNegativeIntegerValue('REQUEST_LOG_RETENTION_INFO_DAYS', 7),
  REQUEST_LOG_RETENTION_WARNING_DAYS: nonNegativeIntegerValue(
    'REQUEST_LOG_RETENTION_WARNING_DAYS',
    28,
  ),
  REQUEST_LOG_RETENTION_ERROR_DAYS: nonNegativeIntegerValue('REQUEST_LOG_RETENTION_ERROR_DAYS', 90),
  REQUEST_LOG_RETENTION_FATAL_DAYS: nonNegativeIntegerValue(
    'REQUEST_LOG_RETENTION_FATAL_DAYS',
    180,
  ),
  CRON_LOG_CLEANUP_CRON: stringValue('CRON_LOG_CLEANUP_CRON', '30 */6 * * *'),
  CRON_LOG_RETENTION_DAYS: nonNegativeIntegerValue('CRON_LOG_RETENTION_DAYS', 90),
  FILE_CLEANUP_CRON: stringValue('FILE_CLEANUP_CRON', '0 */6 * * *'),
  FILE_CLEANUP_SAFETY_WINDOW_MINUTES: nonNegativeIntegerValue(
    'FILE_CLEANUP_SAFETY_WINDOW_MINUTES',
    15,
  ),
};
