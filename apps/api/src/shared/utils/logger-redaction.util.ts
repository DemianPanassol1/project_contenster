const redactedValue = '[REDACTED]';
const sensitiveKeyPattern =
  /(authorization|cookie|password|senha|secret|token|api-key|x-api-key|key)/i;

export type SanitizedLogPayload =
  boolean | null | number | string | SanitizedLogPayload[] | { [key: string]: SanitizedLogPayload };

const sanitizeValue = (value: unknown, depth = 0): SanitizedLogPayload => {
  if (depth > 5) return '[MAX_DEPTH]';
  if (value === undefined) return null;
  if (typeof value === 'string')
    return value.length > 4000 ? `${value.slice(0, 4000)}...[TRUNCATED]` : value;
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Buffer.isBuffer(value)) return '[BINARY]';
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, depth + 1));
  if (typeof value !== 'object') return '[UNSERIALIZABLE]';

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      sensitiveKeyPattern.test(key) ? redactedValue : sanitizeValue(item, depth + 1),
    ]),
  );
};

export const sanitizeLogPayload = (payload: unknown): SanitizedLogPayload => sanitizeValue(payload);
