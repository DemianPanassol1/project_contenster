const toStringPrimitive = (value: unknown): string | null => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  return null;
};

export const parseString = (value: unknown): string | null => {
  const parsed = toStringPrimitive(value)?.trim() ?? null;

  return parsed && parsed.length > 0 ? parsed : null;
};

export const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = toStringPrimitive(value)?.trim();

  if (!normalized || !/^-?(?:\d+|\d+\.\d+)$/.test(normalized)) return null;

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

export const parseInteger = (value: unknown): number | null => {
  const parsed = parseNumber(value);

  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
};

export const parseBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (typeof value !== 'string') return null;

  switch (value.trim().toLowerCase()) {
    case 'true':
    case 'yes':
    case 'sim':
      return true;
    case 'false':
    case 'no':
    case 'nao':
    case 'não':
      return false;
    default:
      return null;
  }
};

export const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const parsed = parseString(item);

    return parsed === null ? [] : [parsed];
  });
};

export const parseNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const parsed = parseNumber(item);

    return parsed === null ? [] : [parsed];
  });
};
