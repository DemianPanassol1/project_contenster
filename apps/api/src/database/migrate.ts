import 'reflect-metadata';

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { DataSource, MigrationExecutor } from 'typeorm';

import { API_ROOT_PATH } from '@/infrastructure/config/app.config';
import { createDataSourceOptions } from '@/infrastructure/database/database.config';

type MigrationCommand = 'generate' | 'run' | 'show' | 'revert';

const migrationNamePattern = /^[A-Za-z0-9_-]+$/;
const typeormCliPath = createRequire(join(API_ROOT_PATH, 'package.json')).resolve('typeorm/cli.js');
const migrationsSourcePath = join(API_ROOT_PATH, 'src', 'database', 'migrations');
const dataSourcePath = join(
  API_ROOT_PATH,
  'dist',
  'infrastructure',
  'database',
  'typeorm.config.js',
);

type MigrationInfo = {
  name: string;
  timestamp: number;
};

const usage = (): string =>
  [
    'Usage:',
    '  pnpm --filter api migration:generate --name <migration-name>',
    '  pnpm --filter api migration:run',
    '  pnpm --filter api migration:show',
    '  pnpm --filter api migration:revert',
  ].join('\n');

const requireMigrationName = (args: string[]): string => {
  if (args.length !== 2 || args[0] !== '--name' || !migrationNamePattern.test(args[1])) {
    throw new Error(
      'Invalid migration name. Use --name followed by letters, numbers, underscore or hyphen.',
    );
  }

  return args[1];
};

const runGenerate = (args: string[]): void => {
  const migrationName = requireMigrationName(args);

  if (!existsSync(migrationsSourcePath)) {
    mkdirSync(migrationsSourcePath, { recursive: true });
  }

  const outputPath = join(migrationsSourcePath, migrationName);
  const result = spawnSync(
    process.execPath,
    [typeormCliPath, 'migration:generate', outputPath, '--dataSource', dataSourcePath],
    {
      cwd: API_ROOT_PATH,
      encoding: 'utf8',
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  if (result.error) throw result.error;

  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (output) process.stdout.write(output.endsWith('\n') ? output : `${output}\n`);
  if (result.status !== 0) process.exitCode = result.status ?? 1;
};

const withDataSource = async (
  operation: (dataSource: DataSource) => Promise<void>,
): Promise<void> => {
  const dataSource = new DataSource(createDataSourceOptions());

  try {
    await dataSource.initialize();
    await operation(dataSource);
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
};

const formatMigration = (migration: MigrationInfo): string =>
  `${migration.timestamp} ${migration.name}`;

const getConfiguredMigrationNames = (dataSource: DataSource): Set<string> =>
  new Set(
    dataSource.migrations.map((migration) => {
      const namedMigration = migration as { name?: string };

      return namedMigration.name ?? migration.constructor.name;
    }),
  );

const printMigrationStatus = async (dataSource: DataSource): Promise<MigrationInfo[]> => {
  const executor = new MigrationExecutor(dataSource);
  const [executed, pending] = await Promise.all([
    executor.getExecutedMigrations(),
    executor.getPendingMigrations(),
  ]);
  const configuredMigrationNames = getConfiguredMigrationNames(dataSource);
  const databaseOnly = executed.filter(
    (migration) => !configuredMigrationNames.has(migration.name),
  );

  process.stdout.write(`Configured migrations: ${dataSource.migrations.length}.\n`);
  process.stdout.write(`Executed migrations: ${executed.length}.\n`);
  for (const migration of executed) {
    process.stdout.write(`  [executed] ${formatMigration(migration)}\n`);
  }

  process.stdout.write(`Pending migrations: ${pending.length}.\n`);
  for (const migration of pending) {
    process.stdout.write(`  [pending] ${formatMigration(migration)}\n`);
  }

  if (databaseOnly.length > 0) {
    process.stdout.write(`Database-only migrations: ${databaseOnly.length}.\n`);
    for (const migration of databaseOnly) {
      process.stdout.write(`  [database-only] ${formatMigration(migration)}\n`);
    }
  }

  if (pending.length === 0 && databaseOnly.length === 0) {
    process.stdout.write('Migration state is synchronized.\n');
  }

  return executed;
};

const run = async (): Promise<void> => {
  const command = process.argv[2] as MigrationCommand | undefined;
  const args = process.argv.slice(3);

  if (!command || !['generate', 'run', 'show', 'revert'].includes(command)) {
    throw new Error(usage());
  }

  if (command === 'generate') {
    runGenerate(args);
    return;
  }

  if (args.length > 0) throw new Error(usage());

  await withDataSource(async (dataSource) => {
    if (command === 'run') {
      await printMigrationStatus(dataSource);

      const migrations = await dataSource.runMigrations();

      process.stdout.write(`Applied ${migrations.length} migration(s).\n`);
      for (const migration of migrations) {
        process.stdout.write(`  [applied] ${formatMigration(migration)}\n`);
      }

      await printMigrationStatus(dataSource);
      return;
    }

    if (command === 'show') {
      await printMigrationStatus(dataSource);
      return;
    }

    const executed = await printMigrationStatus(dataSource);
    const lastMigration = executed[0];

    if (!lastMigration) {
      process.stdout.write('No executed migration is available to revert.\n');
      return;
    }

    process.stdout.write(`Reverting migration: ${formatMigration(lastMigration)}.\n`);
    await dataSource.undoLastMigration();
    process.stdout.write(`Reverted migration: ${formatMigration(lastMigration)}.\n`);
    await printMigrationStatus(dataSource);
  });
};

void run();
