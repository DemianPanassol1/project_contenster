import { settings } from '@/infrastructure/config/app.config';

const DATE_TIME_PART_NAMES = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'timeZoneName',
] as const;

type DateTimePartName = (typeof DATE_TIME_PART_NAMES)[number];

const parseOffset = (timeZoneName: string): string => {
  if (timeZoneName === 'GMT' || timeZoneName === 'UTC') return '+00:00';

  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(timeZoneName);

  if (!match) {
    throw new Error(`Unable to resolve time zone offset from ${timeZoneName}.`);
  }

  const [, sign, hours, minutes = '00'] = match;

  return `${sign}${hours.padStart(2, '0')}:${minutes}`;
};

export const serializeApplicationDateTime = (date: Date): string => {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Cannot serialize an invalid date.');
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone: settings.APP_TIMEZONE,
    timeZoneName: 'longOffset',
    year: 'numeric',
  });
  const parts = new Map(
    formatter
      .formatToParts(date)
      .filter((part): part is Intl.DateTimeFormatPart & { type: DateTimePartName } =>
        DATE_TIME_PART_NAMES.includes(part.type as DateTimePartName),
      )
      .map((part) => [part.type, part.value]),
  );
  const readPart = (name: DateTimePartName): string => {
    const value = parts.get(name);

    if (!value) {
      throw new Error(`Unable to serialize date-time part ${name}.`);
    }

    return value;
  };

  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

  return `${readPart('year')}-${readPart('month')}-${readPart('day')}T${readPart('hour')}:${readPart('minute')}:${readPart('second')}.${milliseconds}${parseOffset(readPart('timeZoneName'))}`;
};
