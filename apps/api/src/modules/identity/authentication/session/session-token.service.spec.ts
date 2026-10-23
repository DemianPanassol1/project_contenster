import { describe, expect, it } from 'vitest';

import { readCookieValue } from './helpers/session-cookie.util';
import { SessionTokenService } from './session-token.service';

describe('SessionTokenService', () => {
  const service = new SessionTokenService({ t: (key: string) => key } as never);

  it('creates opaque tokens and produces a stable hash for each token', () => {
    const token = service.create();

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).toHaveLength(64);
    expect(service.hash(token)).toBe(service.hash(token));
    expect(service.hash(token)).not.toBe(service.hash(service.create()));
  });
});

describe('readCookieValue', () => {
  it('reads and decodes only the requested cookie', () => {
    expect(readCookieValue('theme=dark; session=opaque%20token; another=value', 'session')).toBe(
      'opaque token',
    );
  });

  it('returns null when no matching cookie exists', () => {
    expect(readCookieValue('theme=dark', 'session')).toBeNull();
  });
});
