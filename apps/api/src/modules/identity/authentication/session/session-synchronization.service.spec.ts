import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { RequestLogAccessType, SessionContextType } from '@contenster/shared';

import { SessionSynchronizationService } from './session-synchronization.service';

const session = (clientId: number) => ({
  context: {
    accessType: RequestLogAccessType.client,
    client: {
      document: '12345678901',
      documentType: 'cpf',
      id: clientId,
      languages: [],
      name: `Client ${clientId}`,
    },
    profile: { description: null, id: clientId, name: `Profile ${clientId}` },
    type: SessionContextType.client,
  },
  modules: [],
  user: {
    email: 'admin@test.local',
    imageUrl: null,
    id: clientId,
    isSuperuser: false,
    name: 'Admin',
    username: 'admin',
  },
});

const storedSession = (clientId: number) => ({
  expiresAt: '2030-01-01T00:00:00.000Z',
  session: session(clientId),
  staySignedIn: false,
});

const globalStoredSession = () => ({
  expiresAt: '2030-01-01T00:00:00.000Z',
  session: {
    context: { type: SessionContextType.global },
    modules: [],
    user: {
      email: 'superuser@test.local',
      imageUrl: null,
      id: 1,
      isSuperuser: true,
      name: 'Superuser',
      username: 'superuser',
    },
  },
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

  it('rebuilds global sessions with the global resolver', async () => {
    const globalSession = globalStoredSession().session;
    const authenticationService = {
      resolveGlobalSession: vi.fn().mockResolvedValue(globalSession),
    };
    const sessionAuthenticationService = {
      getByToken: vi.fn().mockResolvedValue(globalStoredSession()),
      getTtlByHash: vi.fn().mockResolvedValue(300),
      replace: vi.fn().mockResolvedValue(undefined),
      tokenHash: vi.fn().mockReturnValue('hash'),
    };
    const service = new SessionSynchronizationService(
      authenticationService as never,
      sessionAuthenticationService as never,
      { t: vi.fn() } as never,
    );

    await service.synchronizeByToken('token');

    expect(authenticationService.resolveGlobalSession).toHaveBeenCalledWith(1);
  });
});
