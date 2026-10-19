import type { AuthenticatedSession } from '@contenster/shared';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { settings } from '@/infrastructure/config/app.config';
import { RedisUnavailableError } from '@/infrastructure/redis/redis-unavailable.error';
import {
  generatePasswordHash,
  validatePasswordHash,
} from '@/infrastructure/security/password.util';
import { AuthorizationResolverService } from '@/modules/authorization/authorization-resolver.service';
import { toResponseDto } from '@/shared/responses';
import { resolveTranslation } from '@/shared/translations';

import { PASSWORD_RESET_TOKEN_PURPOSE } from './constants/password-reset-token.constants';
import type { AuthorizeRequestDto } from './dto/req/authorize-request.dto';
import type { ForgotPasswordRequestDto } from './dto/req/forgot-password-request.dto';
import type { ResetPasswordRequestDto } from './dto/req/reset-password-request.dto';
import type { SignInRequestDto } from './dto/req/sign-in-request.dto';
import type { SwitchClientRequestDto } from './dto/req/switch-client-request.dto';
import {
  AuthenticatedSessionResponseDto,
  AuthorizeResponseDto,
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  SessionResponseDto,
  SignOutResponseDto,
} from './dto/res';
import {
  createPasswordResetTokenSignOptions,
  createPasswordResetTokenVerifyOptions,
} from './helpers/password-reset-token.helper';
import { resolveSessionLanguages, resolveSessionLocale } from './helpers/session-locale.helper';
import { readCookieValue } from './session/helpers/session-cookie.util';
import { SessionAuthenticationService } from './session/session-authentication.service';
import { AuthenticationRepository } from './authentication.repository';
import { PasswordRecoveryEmailService } from './password-recovery-email.service';
import { PasswordResetTokenStore } from './password-reset-token.store';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly authorizationResolver: AuthorizationResolverService,
    private readonly sessionAuthenticationService: SessionAuthenticationService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly jwtService: JwtService,
    private readonly passwordRecoveryEmailService: PasswordRecoveryEmailService,
    private readonly passwordResetTokenStore: PasswordResetTokenStore,
  ) {}

  async authorize(request: AuthorizeRequestDto): Promise<AuthorizeResponseDto> {
    const user = await this.validateCredentials(request.username, request.password);
    const userWithClients = await this.authenticationRepository.findUserClients(user.id);

    return toResponseDto(AuthorizeResponseDto, {
      clients: userWithClients.userProfiles.map(({ client }) => ({
        label: client.tradeName,
        value: client.id,
        disabled: false,
        metadata: {
          corporateName: client.corporateName,
          document: client.document,
        },
      })),
    });
  }

  async signIn(request: SignInRequestDto): Promise<{
    token: string;
    ttlSeconds: number;
    response: SessionResponseDto;
  }> {
    const user = await this.validateCredentials(request.username, request.password);
    const session = await this.resolveSession(user.id, request.clientId);
    const result = await this.sessionAuthenticationService.create(session, request.staySignedIn);

    await this.authenticationRepository.updateLastLogin(user.id);

    return {
      token: result.token,
      ttlSeconds: result.ttlSeconds,
      response: toResponseDto(SessionResponseDto, {
        expiresAt: result.storedSession.expiresAt,
        session: result.storedSession.session,
      }),
    };
  }

  async switchClient(
    request: SwitchClientRequestDto,
    userId: number,
    cookieHeader: string | undefined,
  ): Promise<{ token: string; ttlSeconds: number; response: SessionResponseDto }> {
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
      response: toResponseDto(SessionResponseDto, {
        expiresAt: result.storedSession.expiresAt,
        session: result.storedSession.session,
      }),
    };
  }

  async signOut(cookieHeader: string | undefined): Promise<SignOutResponseDto> {
    const token = readCookieValue(cookieHeader, this.sessionAuthenticationService.cookieName);
    if (token) await this.sessionAuthenticationService.destroy(token);

    return toResponseDto(SignOutResponseDto, { signedOut: true });
  }

  async forgotPassword(request: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
    const response = toResponseDto(ForgotPasswordResponseDto, { emailSent: true });

    if (settings.PASSWORD_RESET_TOKEN_SECRET === null) {
      throw new ServiceUnavailableException(
        this.i18n.t('errors.authentication.password_recovery_unavailable'),
      );
    }

    this.passwordRecoveryEmailService.ensureConfigured();

    const user = await this.authenticationRepository.findUserByEmail(request.email);

    if (!user) return response;

    const tokenId = await this.executePasswordResetStore(() =>
      this.passwordResetTokenStore.create(user.id, settings.PASSWORD_RESET_TOKEN_TTL_SECONDS),
    );

    const token = await this.jwtService.signAsync(
      {
        email: user.email,
        jti: tokenId,
        purpose: PASSWORD_RESET_TOKEN_PURPOSE,
        sub: user.id,
      },
      createPasswordResetTokenSignOptions(),
    );

    try {
      await this.passwordRecoveryEmailService.send({
        recipient: user.email,
        recipientName: user.name,
        resetLink: this.buildResetPasswordLink(token),
      });
    } catch (error) {
      await this.executePasswordResetStore(() => this.passwordResetTokenStore.delete(tokenId));
      throw error;
    }

    return response;
  }

  async resetPassword(request: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> {
    if (settings.PASSWORD_RESET_TOKEN_SECRET === null) {
      throw new ServiceUnavailableException(
        this.i18n.t('errors.authentication.password_recovery_unavailable'),
      );
    }

    const tokenPayload = await this.verifyPasswordResetToken(request.token);
    const user = await this.authenticationRepository.findUserByEmail(tokenPayload.email);

    if (!user || user.id !== tokenPayload.sub) {
      throw new BadRequestException(this.i18n.t('errors.authentication.invalid_reset_token'));
    }

    const consumed = await this.executePasswordResetStore(() =>
      this.passwordResetTokenStore.consume(tokenPayload.jti, user.id),
    );

    if (!consumed) {
      throw new BadRequestException(this.i18n.t('errors.authentication.invalid_reset_token'));
    }

    await this.authenticationRepository.updatePassword(
      user.id,
      await generatePasswordHash(request.password),
    );
    await this.sessionAuthenticationService.destroyAllByUser(user.id);

    return toResponseDto(ResetPasswordResponseDto, { passwordReset: true });
  }

  session(session: AuthenticatedSession): AuthenticatedSessionResponseDto {
    return toResponseDto(AuthenticatedSessionResponseDto, session);
  }

  async resolveSession(userId: number, clientId: number): Promise<AuthenticatedSession> {
    const user = await this.authenticationRepository.findUserContext(userId, clientId);
    const userProfile = user?.userProfiles[0];

    if (!user || !userProfile) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    const languages = resolveSessionLanguages(userProfile.client.availableLanguageLinks);
    const locale = resolveSessionLocale(languages);

    if (userProfile.profile.translations.length === 0) {
      throw new UnauthorizedException(
        this.i18n.t('errors.authentication.session_not_authenticated'),
      );
    }

    const profileName = resolveTranslation(userProfile.profile.translations, locale, 'name');
    const profileDescription = resolveTranslation(
      userProfile.profile.translations,
      locale,
      'description',
      { nullable: true },
    );

    return toResponseDto(AuthenticatedSessionResponseDto, {
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
          name: profileName,
          description: profileDescription,
        },
      },
      modules: await this.authorizationResolver.resolve(userProfile.profile.id, clientId, locale),
    });
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

  private async verifyPasswordResetToken(
    token: string,
  ): Promise<{ email: string; jti: string; sub: number }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        email?: unknown;
        jti?: unknown;
        purpose?: unknown;
        sub?: unknown;
      }>(token, createPasswordResetTokenVerifyOptions());

      if (
        payload.purpose !== PASSWORD_RESET_TOKEN_PURPOSE ||
        typeof payload.email !== 'string' ||
        typeof payload.jti !== 'string' ||
        typeof payload.sub !== 'number'
      ) {
        throw new BadRequestException(this.i18n.t('errors.authentication.invalid_reset_token'));
      }

      return { email: payload.email, jti: payload.jti, sub: payload.sub };
    } catch {
      throw new BadRequestException(this.i18n.t('errors.authentication.invalid_reset_token'));
    }
  }

  private buildResetPasswordLink(token: string): string {
    const baseUrl = settings.APP_URL.replace(/\/+$/, '');

    return `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
  }

  private async executePasswordResetStore<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof RedisUnavailableError) {
        throw new ServiceUnavailableException(
          this.i18n.t('errors.authentication.password_recovery_unavailable'),
        );
      }

      throw error;
    }
  }
}
