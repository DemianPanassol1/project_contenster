import { Injectable, UnauthorizedException } from '@nestjs/common';

import { RequestLogAccessType, SessionContextType } from '@contenster/shared';

import { AuthenticationService } from '../authentication.service';

import type { StoredSession } from './types/stored-session.type';
import { SessionAuthenticationService } from './session-authentication.service';

@Injectable()
export class SessionSynchronizationService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
  ) {}

  async synchronizeAll(): Promise<void> {
    for await (const tokenHash of this.sessionAuthenticationService.iterateTokenHashes()) {
      const storedSession = await this.getByHash(tokenHash);
      if (!storedSession) continue;

      try {
        await this.synchronizeStoredSession(tokenHash, storedSession);
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          await this.sessionAuthenticationService.destroyByHash(tokenHash);
          continue;
        }

        throw error;
      }
    }
  }

  private async synchronizeStoredSession(
    tokenHash: string,
    storedSession: StoredSession,
  ): Promise<StoredSession> {
    const { context, user } = storedSession.session;
    const session =
      context.type === SessionContextType.global
        ? await this.authenticationService.resolveGlobalSession(user.id)
        : context.accessType === RequestLogAccessType.superuser
          ? await this.authenticationService.resolveAssumedSession(user.id, context.client.id)
          : await this.authenticationService.resolveSession(user.id, context.client.id);
    const ttlSeconds = await this.getTtl(tokenHash);
    if (ttlSeconds <= 0) return storedSession;

    const updated = { ...storedSession, session };
    await this.sessionAuthenticationService.replace(tokenHash, updated, ttlSeconds);

    return updated;
  }

  private async getByHash(tokenHash: string): Promise<StoredSession | null> {
    return this.sessionAuthenticationService.getByHash(tokenHash);
  }

  private async getTtl(tokenHash: string): Promise<number> {
    return this.sessionAuthenticationService.getTtlByHash(tokenHash);
  }
}
