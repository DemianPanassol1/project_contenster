import { join } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';

import { settings } from '@/infrastructure/config/app.config';

const entitiesPath = join(__dirname, '..', '..', 'modules', '**', 'entities', '*.entity.{ts,js}');
const migrationsPath = join(__dirname, '..', '..', 'database', 'migrations', '*{.ts,.js}');
const entities = process.env.VITEST ? [] : [entitiesPath];
const migrations = process.env.VITEST ? [] : [migrationsPath];

export const createDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: settings.DATABASE_HOST,
  port: settings.DATABASE_PORT,
  username: settings.DATABASE_USER,
  password: settings.DATABASE_PASSWORD,
  database: settings.DATABASE_NAME,
  schema: 'public',
  ssl: settings.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  logging: settings.DATABASE_LOGGING,
  synchronize: false,
  entities,
  migrations,
  extra: {
    max: settings.DATABASE_POOL_MAX,
    options: `-c timezone=${settings.APP_TIMEZONE}`,
  },
});

export const createDatabaseOptions = (): TypeOrmModuleOptions => ({
  ...createDataSourceOptions(),
  autoLoadEntities: true,
});
