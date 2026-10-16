import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

import { settings } from '@/infrastructure/config/app.config';

import { RedisUnavailableError } from './redis-unavailable.error';

type AppRedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisClientService implements OnModuleInit, OnModuleDestroy {
  private readonly client: AppRedisClient;
  private readonly logger = new Logger(RedisClientService.name);
  private connection: Promise<void> | null = null;

  constructor() {
    this.client = createClient({
      database: settings.REDIS_DATABASE,
      disableOfflineQueue: true,
      password: settings.REDIS_PASSWORD ?? undefined,
      socket: {
        connectTimeout: settings.REDIS_CONNECT_TIMEOUT_MS,
        host: settings.REDIS_HOST,
        port: settings.REDIS_PORT,
        reconnectStrategy: (attempts) =>
          attempts >= settings.REDIS_RECONNECT_MAX_RETRIES
            ? false
            : Math.min(
                settings.REDIS_RECONNECT_BASE_DELAY_MS * 2 ** attempts,
                settings.REDIS_RECONNECT_MAX_DELAY_MS,
              ),
        ...(settings.REDIS_TLS ? { servername: settings.REDIS_HOST, tls: true } : {}),
      },
      username: settings.REDIS_USERNAME ?? undefined,
    });
    this.client.on('error', () => this.logger.error('Redis operation failed.'));
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureReady();
    } catch {
      this.logger.warn('Redis is unavailable during startup.');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.close();
  }

  async execute<T>(operation: (client: AppRedisClient) => Promise<T>): Promise<T> {
    try {
      await this.ensureReady();
      return await operation(this.client);
    } catch (error) {
      if (error instanceof RedisUnavailableError) throw error;
      throw new RedisUnavailableError();
    }
  }

  ping(): Promise<string> {
    return this.execute((client) => client.ping());
  }

  private async ensureReady(): Promise<void> {
    if (this.client.isReady) return;
    if (this.client.isOpen) throw new RedisUnavailableError();
    this.connection ??= this.client
      .connect()
      .then(() => undefined)
      .finally(() => {
        this.connection = null;
      });
    try {
      await this.connection;
    } catch {
      throw new RedisUnavailableError();
    }
    if (!this.client.isReady) throw new RedisUnavailableError();
  }
}
