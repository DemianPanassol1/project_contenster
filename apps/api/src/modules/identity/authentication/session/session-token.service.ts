import { createHmac, randomBytes } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { settings } from '@/infrastructure/config/app.config';

@Injectable()
export class SessionTokenService {
  create(): string {
    this.getSecret();

    return randomBytes(48).toString('base64url');
  }

  hash(token: string): string {
    return createHmac('sha256', this.getSecret()).update(token).digest('base64url');
  }

  private getSecret(): string {
    if (!settings.SESSION_HMAC_SECRET) {
      throw new ServiceUnavailableException('Session authentication is not configured.');
    }

    return settings.SESSION_HMAC_SECRET;
  }
}
