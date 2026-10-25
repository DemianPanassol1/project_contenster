const nonEmptyEnvironmentValue = (key: string): string | null => {
  const value = process.env[key]?.trim();

  return value || null;
};

const numberEnvironmentValue = (key: string, fallback: number): number => {
  const value = nonEmptyEnvironmentValue(key);
  const parsedValue = value ? Number(value) : fallback;

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const apiUrl = nonEmptyEnvironmentValue('WEB_API_URL') ?? 'http://localhost:8080/api/v1';

export const webEnv = {
  appEnvironment: nonEmptyEnvironmentValue('WEB_APP_ENVIRONMENT') ?? 'local',
  appVersion: nonEmptyEnvironmentValue('WEB_APP_VERSION') ?? '0.0.0',
  apiTimeoutMs: numberEnvironmentValue('WEB_API_TIMEOUT_MS', 30_000),
  apiUrl: apiUrl.replace(/\/+$/, ''),
};
