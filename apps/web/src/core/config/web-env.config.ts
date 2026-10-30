const nonEmptyEnvironmentValue = (key: string): string | null => {
  const value = process.env[key]?.trim();

  return value || null;
};

const numberEnvironmentValue = (key: string, fallback: number): number => {
  const value = nonEmptyEnvironmentValue(key);
  const parsedValue = value ? Number(value) : fallback;

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const timeZoneEnvironmentValue = (key: string, fallback: string): string => {
  const value = nonEmptyEnvironmentValue(key) ?? fallback;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
  } catch {
    throw new Error(`Invalid time zone value for ${key}: ${value}`);
  }

  return value;
};

const apiUrl = nonEmptyEnvironmentValue('WEB_API_URL') ?? 'http://localhost:8080/api/v1';
const appTimeZone = timeZoneEnvironmentValue('NEXT_PUBLIC_APP_TIMEZONE', 'America/Sao_Paulo');

export const webEnv = {
  appEnvironment: nonEmptyEnvironmentValue('WEB_APP_ENVIRONMENT') ?? 'local',
  appTimeZone,
  appVersion: nonEmptyEnvironmentValue('WEB_APP_VERSION') ?? '0.0.0',
  apiTimeoutMs: numberEnvironmentValue('WEB_API_TIMEOUT_MS', 30_000),
  apiUrl: apiUrl.replace(/\/+$/, ''),
  sessionCookieName: nonEmptyEnvironmentValue('WEB_SESSION_COOKIE_NAME') ?? 'contenster_session',
};
