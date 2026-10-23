import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { InitialSlimCore1792129518441 } from '@/database/migrations/1792129518441-initial-slim-core';
import { BootstrapSlimCore1792129518442 } from '@/database/migrations/1792129518442-bootstrap-slim-core';
import { ScopeModulesAndFunctionalitiesByClient1792135000000 } from '@/database/migrations/1792135000000-scope-modules-and-functionalities-by-client';
import { BootstrapRemainingCoreFunctionalities1792136000000 } from '@/database/migrations/1792136000000-bootstrap-remaining-core-functionalities';
import { AddSystemAdministration1792137000000 } from '@/database/migrations/1792137000000-add-system-administration';

const testRootPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const expectedDatabaseName = 'contenster_slim_core_test';
const expectedRedisDatabase = 1;
const testUploadsPath = resolve(testRootPath, '..', '..', 'writable', 'uploads', 'test');

const loadEnvironment = (): void => {
  dotenv.config({
    override: true,
    path: resolve(testRootPath, '.env.test'),
    quiet: true,
  });
};

const assertDisposableEnvironment = (): void => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Integration tests require NODE_ENV=test.');
  }

  if (process.env.DATABASE_NAME !== expectedDatabaseName) {
    throw new Error(`Integration tests require DATABASE_NAME=${expectedDatabaseName}.`);
  }

  if (Number(process.env.REDIS_DATABASE) !== expectedRedisDatabase) {
    throw new Error(`Integration tests require REDIS_DATABASE=${expectedRedisDatabase}.`);
  }
};

const createDataSource = (): DataSource => {
  const options: DataSourceOptions = {
    database: process.env.DATABASE_NAME,
    entities: [],
    host: process.env.DATABASE_HOST,
    logging: false,
    migrations: [
      InitialSlimCore1792129518441,
      BootstrapSlimCore1792129518442,
      ScopeModulesAndFunctionalitiesByClient1792135000000,
      BootstrapRemainingCoreFunctionalities1792136000000,
      AddSystemAdministration1792137000000,
    ],
    migrationsRun: false,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    schema: 'public',
    ssl: false,
    synchronize: false,
    type: 'postgres',
    username: process.env.DATABASE_USER,
  };

  return new DataSource(options);
};

const resetDatabase = async (withMigrations: boolean): Promise<void> => {
  const dataSource = createDataSource();

  try {
    await dataSource.initialize();
    await dataSource.query('DROP SCHEMA IF EXISTS public CASCADE');
    await dataSource.query('CREATE SCHEMA public');

    if (withMigrations) {
      await dataSource.runMigrations();
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

const assertBootstrapBaseline = async (): Promise<void> => {
  const dataSource = createDataSource();

  try {
    await dataSource.initialize();
    const [{ clients, functionalities, languages }] = await dataSource.query<
      { clients: string; functionalities: string; languages: string }[]
    >(
      'SELECT (SELECT COUNT(*) FROM clientes)::text AS clients, (SELECT COUNT(*) FROM idiomas)::text AS languages, (SELECT COUNT(*) FROM funcionalidades)::text AS functionalities',
    );

    if (clients !== '1' || languages !== '3' || functionalities !== '12') {
      throw new Error('Bootstrap migrations did not create the expected Slim Core baseline.');
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

const clearRedis = async (): Promise<void> => {
  const client = createClient({
    database: expectedRedisDatabase,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  try {
    await client.connect();
    await client.flushDb();
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
};

const clearUploads = (): Promise<void> => rm(testUploadsPath, { force: true, recursive: true });

export default async (): Promise<() => Promise<void>> => {
  loadEnvironment();
  assertDisposableEnvironment();

  await resetDatabase(true);
  await assertBootstrapBaseline();
  await clearRedis();
  await clearUploads();

  return async (): Promise<void> => {
    await clearRedis();
    await clearUploads();
    await resetDatabase(false);
  };
};
