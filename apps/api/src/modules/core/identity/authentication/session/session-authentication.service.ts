import type { AuthenticatedSession } from '@contenster/shared';
import { Injectable } from '@nestjs/common';

import { settings } from '@/infrastructure/config/app.config';

import type { StoredSession } from './types/stored-session.type';
import { RedisSessionStore } from './redis-session.store';
import { SessionTokenService } from './session-token.service';

@Injectable()
export class SessionAuthenticationService {
  readonly cookieName = settings.SESSION_COOKIE_NAME;

  constructor(
    private readonly sessionStore: RedisSessionStore,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async create(
    session: AuthenticatedSession,
    staySignedIn: boolean,
  ): Promise<{ token: string; storedSession: StoredSession; ttlSeconds: number }> {
    const token = this.sessionTokenService.create();
    const ttlSeconds = staySignedIn
      ? settings.SESSION_REMEMBERED_TTL_SECONDS
      : settings.SESSION_NORMAL_TTL_SECONDS;
    const storedSession = {
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      staySignedIn,
      session,
    };

    await this.sessionStore.save(this.sessionTokenService.hash(token), storedSession, ttlSeconds);

    return { token, storedSession, ttlSeconds };
  }

  async getByToken(token: string): Promise<StoredSession | null> {
    return this.getByHash(this.sessionTokenService.hash(token));
  }

  async getByHash(tokenHash: string): Promise<StoredSession | null> {
    const storedSession = await this.sessionStore.get(tokenHash);

    if (!storedSession || new Date(storedSession.expiresAt).getTime() <= Date.now()) {
      if (storedSession) await this.sessionStore.delete(tokenHash);
      return null;
    }

    return storedSession;
  }

  async destroy(token: string): Promise<void> {
    await this.sessionStore.delete(this.sessionTokenService.hash(token));
  }

  async destroyByHash(tokenHash: string): Promise<void> {
    await this.sessionStore.delete(tokenHash);
  }

  async destroyAllByUser(userId: number): Promise<void> {
    await this.destroyUserSessions(userId);
  }

  async destroyAllByUserExcept(userId: number, preservedTokenHash: string): Promise<void> {
    await this.destroyUserSessions(userId, preservedTokenHash);
  }

  private async destroyUserSessions(userId: number, preservedTokenHash?: string): Promise<void> {
    for await (const tokenHash of this.iterateTokenHashes()) {
      if (tokenHash === preservedTokenHash) {
        continue;
      }

      const storedSession = await this.getByHash(tokenHash);

      if (storedSession?.session.user.id === userId) {
        await this.destroyByHash(tokenHash);
      }
    }
  }

  async getTtlByHash(tokenHash: string): Promise<number> {
    return this.sessionStore.ttl(tokenHash);
  }

  async replace(
    tokenHash: string,
    storedSession: StoredSession,
    ttlSeconds: number,
  ): Promise<void> {
    await this.sessionStore.save(tokenHash, storedSession, ttlSeconds);
  }

  tokenHash(token: string): string {
    return this.sessionTokenService.hash(token);
  }

  iterateTokenHashes(): AsyncGenerator<string> {
    return this.sessionStore.iterateTokenHashes();
  }

  cookieOptions(ttlSeconds: number): {
    httpOnly: true;
    maxAge: number;
    path: string;
    sameSite: 'lax';
    secure: boolean;
  } {
    return {
      httpOnly: true,
      maxAge: ttlSeconds * 1000,
      path: '/',
      sameSite: 'lax',
      secure: settings.NODE_ENV === 'production',
    };
  }

  clearCookieOptions(): { httpOnly: true; path: string; sameSite: 'lax'; secure: boolean } {
    return {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: settings.NODE_ENV === 'production',
    };
  }
}
