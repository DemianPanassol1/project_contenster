export class RedisUnavailableError extends Error {
  constructor() {
    super('Redis is temporarily unavailable.');
    this.name = 'RedisUnavailableError';
  }
}
