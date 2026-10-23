import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { RequestLogAccessType, SessionContextType } from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { toResponseDto } from '@/shared/responses';

import { AuthenticationService } from '../authentication.service';
import { SynchronizeSessionResponseDto } from '../dto/res';

import { readCookieValue } from './helpers/session-cookie.util';
import type { StoredSession } from './types/stored-session.type';
import { SessionAuthenticationService } from './session-authentication.service';

@Injectable()
export class SessionSynchronizationService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async synchronize(cookieHeader: string | undefined): Promise<SynchronizeSessionResponseDto> {
    const token = readCookieValue(cookieHeader, this.sessionAuthenticationService.cookieName);
    if (!token) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    return this.synchronizeByToken(token);
  }

  async synchronizeByToken(token: string): Promise<SynchronizeSessionResponseDto> {
    const tokenHash = this.sessionAuthenticationService.tokenHash(token);
    const storedSession = await this.sessionAuthenticationService.getByToken(token);
    if (!storedSession) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    const updated = await this.synchronizeStoredSession(tokenHash, storedSession);

    return toResponseDto(SynchronizeSessionResponseDto, {
      sessionChanged: JSON.stringify(updated.session) !== JSON.stringify(storedSession.session),
      expiresAt: updated.expiresAt,
      session: updated.session,
    });
  }

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
