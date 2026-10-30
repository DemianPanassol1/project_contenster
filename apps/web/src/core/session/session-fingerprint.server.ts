import 'server-only';

import type { AuthenticatedSession } from '@contenster/shared';

const normalizeSessionValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeSessionValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeSessionValue(nestedValue)]),
    );
  }

  return value;
};

export const createSessionFingerprint = (session: AuthenticatedSession): string =>
  JSON.stringify(normalizeSessionValue(session));
