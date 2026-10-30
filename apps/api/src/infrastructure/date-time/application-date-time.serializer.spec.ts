import { describe, expect, it } from 'vitest';

import { serializeApplicationDateTime } from './application-date-time.serializer';

describe('serializeApplicationDateTime', () => {
  it('serializes dates with the configured application offset', () => {
    const value = serializeApplicationDateTime(new Date('2026-10-30T13:56:42.123Z'));

    expect(value).toBe('2026-10-30T10:56:42.123-03:00');
  });

  it('rejects invalid dates', () => {
    expect(() => serializeApplicationDateTime(new Date('invalid'))).toThrow(
      'Cannot serialize an invalid date.',
    );
  });
});
