import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type EmptyDateValue = '' | null;

export const DATE_VALUE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_VALUE_FORMAT = 'YYYY-MM-DDTHH:mm';

const normalizePickerValue = (value: string, format: string): string => {
  if (format === DATE_VALUE_FORMAT && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const normalizedValue = value.replace(' ', 'T');

  if (format === DATETIME_VALUE_FORMAT && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(normalizedValue)) {
    return normalizedValue.slice(0, 16);
  }

  return value;
};

export const parsePickerValue = (value: unknown, format: string): Dayjs | null => {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const parsedValue = dayjs(normalizePickerValue(value, format), format, true);

  return parsedValue.isValid() ? parsedValue : null;
};
