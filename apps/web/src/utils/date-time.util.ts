type DateTimeValue = Date | number | string;
type DateTimeStyle = 'medium' | 'short';

const parseDateTime = (value: DateTimeValue): Date | null => {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateTime = (
  value: DateTimeValue,
  locale: string,
  timeStyle: DateTimeStyle = 'medium',
): string => {
  const date = parseDateTime(value);

  if (!date) return '';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle,
  }).format(date);
};
