import type { AuthenticatedSession, AuthorizeResponse, SessionResponse } from '@contenster/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { validatePasswordHash } from '@/infrastructure/security/password.util';
import { AuthorizationResolverService } from '@/modules/authorization/authorization-resolver.service';

import type { AuthorizeRequestDto } from './dto/req/authorize-request.dto';
import type { SignInRequestDto } from './dto/req/sign-in-request.dto';
import type { SwitchClientRequestDto } from './dto/req/switch-client-request.dto';
import { readCookieValue } from './session/helpers/session-cookie.util';
import { SessionAuthenticationService } from './session/session-authentication.service';
import { AuthenticationRepository } from './authentication.repository';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly authorizationResolver: AuthorizationResolverService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async authorize(request: AuthorizeRequestDto): Promise<AuthorizeResponse> {
    const user = await this.validateCredentials(request.username, request.password);
    const userWithClients = await this.authenticationRepository.findUserClients(user.id);

    return {
      clients: userWithClients.userProfiles.map(({ client }) => ({
        label: client.tradeName,
        value: client.id,
        disabled: false,
        metadata: {
          corporateName: client.corporateName,
          document: client.document,
        },
      })),
    };
  }

  async signIn(
    request: SignInRequestDto,
  ): Promise<{ token: string; ttlSeconds: number; response: SessionResponse }> {
    const user = await this.validateCredentials(request.username, request.password);
    const session = await this.resolveSession(user.id, request.clientId);
    const result = await this.sessionAuthenticationService.create(session, request.staySignedIn);

    await this.authenticationRepository.updateLastLogin(user.id);

    return {
      token: result.token,
      ttlSeconds: result.ttlSeconds,
      response: {
        expiresAt: result.storedSession.expiresAt,
        session: result.storedSession.session,
      },
    };
  }

  async switchClient(
    request: SwitchClientRequestDto,
    userId: number,
    cookieHeader: string | undefined,
  ): Promise<{ token: string; ttlSeconds: number; response: SessionResponse }> {
    const previousToken = this.getSessionTokenOrFail(cookieHeader);
    const previousSession = await this.sessionAuthenticationService.getByToken(previousToken);
    if (!previousSession) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    const session = await this.resolveSession(userId, request.clientId);
    const result = await this.sessionAuthenticationService.create(
      session,
      previousSession.staySignedIn,
    );
    await this.sessionAuthenticationService.destroy(previousToken);

    return {
      token: result.token,
      ttlSeconds: result.ttlSeconds,
      response: {
        expiresAt: result.storedSession.expiresAt,
        session: result.storedSession.session,
      },
    };
  }

  async signOut(cookieHeader: string | undefined): Promise<void> {
    const token = readCookieValue(cookieHeader, this.sessionAuthenticationService.cookieName);
    if (token) await this.sessionAuthenticationService.destroy(token);
  }

  async resolveSession(userId: number, clientId: number): Promise<AuthenticatedSession> {
    const user = await this.authenticationRepository.findUserContext(userId, clientId);
    const userProfile = user?.userProfiles[0];

    if (!user || !userProfile) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    const languages = userProfile.client.availableLanguageLinks
      .map(({ language }) => language)
      .filter((language): language is NonNullable<typeof language> => Boolean(language));
    const languageCode =
      languages.find((language) => language.languageCode === 'pt')?.languageCode ??
      languages[0]?.languageCode ??
      'pt';
    const profileTranslation =
      userProfile.profile.translations.find(
        (translation) => translation.language.languageCode === languageCode,
      ) ?? userProfile.profile.translations[0];

    if (!profileTranslation) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      context: {
        client: {
          id: userProfile.client.id,
          name: userProfile.client.tradeName,
          languages: languages.map((language) => ({
            id: language.id,
            languageCode: language.languageCode,
            name: language.name,
          })),
        },
        profile: {
          id: userProfile.profile.id,
          name: profileTranslation.name,
          description: profileTranslation.description,
        },
      },
      modules: await this.authorizationResolver.resolve(
        userProfile.profile.id,
        clientId,
        languageCode,
      ),
    };
  }

  private async validateCredentials(username: string, password: string) {
    const user = await this.authenticationRepository.findUserByUsernameOrEmail(username);
    if (!user || !(await validatePasswordHash(user.passwordHash, password))) {
      throw new UnauthorizedException(this.i18n.t('errors.authentication.invalid_credentials'));
    }

    return user;
  }

  private getSessionTokenOrFail(cookieHeader: string | undefined): string {
    const token = readCookieValue(cookieHeader, this.sessionAuthenticationService.cookieName);
    if (!token) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    return token;
  }
}
