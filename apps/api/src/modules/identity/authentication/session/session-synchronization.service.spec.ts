import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { SessionSynchronizationService } from './session-synchronization.service';

const session = (clientId: number) => ({
  context: {
    client: { id: clientId, languages: [], name: `Client ${clientId}` },
    profile: { description: null, id: clientId, name: `Profile ${clientId}` },
  },
  modules: [],
  user: { email: 'admin@test.local', id: clientId, name: 'Admin', username: 'admin' },
});

const storedSession = (clientId: number) => ({
  expiresAt: '2030-01-01T00:00:00.000Z',
  session: session(clientId),
  staySignedIn: false,
});

const tokenHashes = async function* (...values: string[]): AsyncGenerator<string> {
  for (const value of values) {
    await Promise.resolve();
    yield value;
  }
};

describe('SessionSynchronizationService', () => {
  it('rebuilds valid sessions and discards sessions whose context is no longer valid', async () => {
    const authenticationService = {
      resolveSession: vi
        .fn()
        .mockResolvedValueOnce(session(1))
        .mockRejectedValueOnce(new UnauthorizedException()),
    };
    const sessionAuthenticationService = {
      destroyByHash: vi.fn().mockResolvedValue(undefined),
      getByHash: vi
        .fn()
        .mockResolvedValueOnce(storedSession(1))
        .mockResolvedValueOnce(storedSession(2)),
      getTtlByHash: vi.fn().mockResolvedValue(300),
      iterateTokenHashes: () => tokenHashes('hash-1', 'hash-2'),
      replace: vi.fn().mockResolvedValue(undefined),
    };
    const service = new SessionSynchronizationService(
      authenticationService as never,
      sessionAuthenticationService as never,
      { t: vi.fn() } as never,
    );

    await service.synchronizeAll();

    expect(sessionAuthenticationService.replace).toHaveBeenCalledWith(
      'hash-1',
      expect.objectContaining({ session: session(1) }),
      300,
    );
    expect(sessionAuthenticationService.destroyByHash).toHaveBeenCalledWith('hash-2');
  });

  it('rejects synchronization without the opaque session cookie', async () => {
    const service = new SessionSynchronizationService(
      {} as never,
      { cookieName: 'contenster_session' } as never,
      { t: vi.fn().mockReturnValue('Unauthorized') } as never,
    );

    await expect(service.synchronize(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
