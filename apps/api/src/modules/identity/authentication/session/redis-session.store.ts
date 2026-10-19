import { Injectable } from '@nestjs/common';

import { settings } from '@/infrastructure/config/app.config';
import { RedisClientService } from '@/infrastructure/redis/redis-client.service';

import type { StoredSession } from './types/stored-session.type';

@Injectable()
export class RedisSessionStore {
  constructor(private readonly redisClient: RedisClientService) {}

  async get(tokenHash: string): Promise<StoredSession | null> {
    const value = await this.redisClient.execute((client) =>
      client.get(this.sessionKey(tokenHash)),
    );

    return value ? (JSON.parse(value) as StoredSession) : null;
  }

  async save(tokenHash: string, storedSession: StoredSession, ttlSeconds: number): Promise<void> {
    await this.redisClient.execute(async (client) => {
      await client.set(this.sessionKey(tokenHash), JSON.stringify(storedSession), {
        EX: ttlSeconds,
      });
      await client.sAdd(this.indexKey(), tokenHash);
    });
  }

  async delete(tokenHash: string): Promise<void> {
    await this.redisClient.execute(async (client) => {
      await client.del(this.sessionKey(tokenHash));
      await client.sRem(this.indexKey(), tokenHash);
    });
  }

  async ttl(tokenHash: string): Promise<number> {
    return this.redisClient.execute((client) => client.ttl(this.sessionKey(tokenHash)));
  }

  async *iterateTokenHashes(): AsyncGenerator<string> {
    let cursor = '0';

    do {
      const result = await this.redisClient.execute((client) =>
        client.sScan(this.indexKey(), cursor, { COUNT: 100 }),
      );
      cursor = result.cursor;

      for (const tokenHash of result.members) yield tokenHash;
    } while (cursor !== '0');
  }

  private sessionKey(tokenHash: string): string {
    return `${settings.SESSION_KEY_PREFIX}:session:${tokenHash}`;
  }

  private indexKey(): string {
    return `${settings.SESSION_KEY_PREFIX}:session-index`;
  }
}
