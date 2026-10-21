import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { createTransport } from 'nodemailer';

import type { I18nTranslations } from '@/i18n/translations';
import { settings } from '@/infrastructure/config/app.config';
import { getCurrentLocale } from '@/shared/i18n';

import {
  escapePasswordRecoveryEmailHtml,
  resolvePasswordRecoveryEmailLocale,
} from './helpers/password-recovery-email.helper';
import type {
  PasswordRecoveryEmailLocale,
  PasswordRecoveryMailConfiguration,
  SendPasswordRecoveryEmailInput,
} from './types/password-recovery-email.type';

@Injectable()
export class PasswordRecoveryEmailService {
  private readonly logger = new Logger(PasswordRecoveryEmailService.name);

  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  ensureConfigured(): void {
    this.getConfiguration();
  }

  async send(input: SendPasswordRecoveryEmailInput): Promise<void> {
    const configuration = this.getConfiguration();

    const locale = resolvePasswordRecoveryEmailLocale(getCurrentLocale());
    const template = await this.readTemplate(locale);
    const html = template
      .replaceAll('[USER_NAME]', escapePasswordRecoveryEmailHtml(input.recipientName))
      .replaceAll('[RESET_LINK]', escapePasswordRecoveryEmailHtml(input.resetLink));
    const transport = createTransport({
      auth: {
        pass: configuration.password,
        user: configuration.user,
      },
      host: configuration.host,
      port: configuration.port,
      secure: settings.MAIL_SECURE,
    });

    try {
      await transport.sendMail({
        from: this.senderAddress(configuration),
        html,
        subject: this.subject(locale),
        to: input.recipient,
      });
    } catch (error) {
      this.logger.error('Password recovery email delivery failed.', error);

      throw new ServiceUnavailableException(
        this.i18n.t('errors.authentication.password_recovery_unavailable'),
      );
    }
  }

  private getConfiguration(): PasswordRecoveryMailConfiguration {
    if (
      settings.MAIL_HOST === null ||
      settings.MAIL_PORT === null ||
      settings.MAIL_USER === null ||
      settings.MAIL_PASSWORD === null ||
      settings.MAIL_FROM_ADDRESS === null
    ) {
      throw new ServiceUnavailableException(
        this.i18n.t('errors.authentication.password_recovery_unavailable'),
      );
    }

    return {
      fromAddress: settings.MAIL_FROM_ADDRESS,
      fromName: settings.MAIL_FROM_NAME,
      host: settings.MAIL_HOST,
      password: settings.MAIL_PASSWORD,
      port: settings.MAIL_PORT,
      user: settings.MAIL_USER,
    };
  }

  private readTemplate(locale: PasswordRecoveryEmailLocale): Promise<string> {
    return readFile(join(__dirname, 'templates', 'password-recovery', `${locale}.html`), 'utf8');
  }

  private senderAddress(configuration: PasswordRecoveryMailConfiguration): string {
    if (configuration.fromName === null) return configuration.fromAddress;

    return `"${configuration.fromName}" <${configuration.fromAddress}>`;
  }

  private subject(locale: PasswordRecoveryEmailLocale): string {
    return this.i18n.t('emails.password_recovery.subject', { lang: locale });
  }
}
