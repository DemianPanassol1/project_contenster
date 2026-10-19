import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { settings } from '@/infrastructure/config/app.config';
import { RedisClientService } from '@/infrastructure/redis/redis-client.service';

@Injectable()
export class PasswordResetTokenStore {
  constructor(private readonly redisClient: RedisClientService) {}

  async create(userId: number, ttlSeconds: number): Promise<string> {
    const tokenId = randomBytes(32).toString('base64url');

    await this.redisClient.execute((client) =>
      client.set(this.tokenKey(tokenId), userId.toString(), { EX: ttlSeconds }),
    );

    return tokenId;
  }

  async consume(tokenId: string, userId: number): Promise<boolean> {
    const storedUserId = await this.redisClient.execute((client) =>
      client.getDel(this.tokenKey(tokenId)),
    );

    return storedUserId === userId.toString();
  }

  delete(tokenId: string): Promise<void> {
    return this.redisClient.execute(async (client) => {
      await client.del(this.tokenKey(tokenId));
    });
  }

  private tokenKey(tokenId: string): string {
    const tokenHash = createHash('sha256').update(tokenId).digest('hex');

    return `${settings.SESSION_KEY_PREFIX}:password-reset:${tokenHash}`;
  }
}
