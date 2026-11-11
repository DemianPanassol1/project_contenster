import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { coreMigrations } from '@/database/migration-registry';

const testRootPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const expectedDatabaseName = 'contenster_slim_core_test';
const expectedRedisDatabase = 1;
const testUploadsPath = resolve(testRootPath, '..', '..', 'writable', 'uploads', 'test');
const testFunctionalities = [
  { names: ['Clientes', 'Clients', 'Clientes'], order: 0, slug: 'clients' },
  { names: ['Usuários', 'Users', 'Usuarios'], order: 1, slug: 'users' },
  { names: ['Perfis', 'Profiles', 'Perfiles'], order: 2, slug: 'profiles' },
  { names: ['Módulos', 'Modules', 'Módulos'], order: 4, slug: 'modules' },
  {
    names: ['Funcionalidades', 'Functionalities', 'Funcionalidades'],
    order: 5,
    slug: 'functionalities',
  },
  { names: ['Países', 'Countries', 'Países'], order: 6, slug: 'countries' },
  { names: ['Estados', 'States', 'Estados'], order: 7, slug: 'states' },
  { names: ['Cidades', 'Cities', 'Ciudades'], order: 8, slug: 'cities' },
  { names: ['Armazenamento', 'Storage', 'Almacenamiento'], order: 9, slug: 'client-storage' },
  {
    names: ['Modelos de acesso', 'Access models', 'Modelos de acceso'],
    order: 10,
    slug: 'access-models',
  },
  { names: ['Logs', 'Logs', 'Registros'], order: 11, slug: 'client-logs' },
] as const;

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
    migrations: coreMigrations,
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

const createTestBootstrapFixture = async (): Promise<void> => {
  const dataSource = createDataSource();

  try {
    await dataSource.initialize();

    const [city] = await dataSource.query<Array<{ id: number }>>(
      `SELECT "id" FROM "cidades" WHERE "codigo_ibge" = '5300108'`,
    );

    if (!city) {
      throw new Error('Test bootstrap fixture could not resolve Brasília.');
    }

    const [client] = await dataSource.query<Array<{ id: number }>>(
      `
        INSERT INTO "clientes" (
          "razao_social", "nome_fantasia", "documento", "tipo_documento", "email",
          "telefone_principal", "endereco", "numero_endereco", "cep", "bairro", "slug",
          "cidade_id", "eh_ativo"
        )
        VALUES (
          'Cliente Inicial de Testes Ltda.', 'Cliente Inicial de Testes', '00000000000191', 'cnpj',
          'admin@cliente-inicial.test', '00000000000', 'Endereço de testes', '1', '70000000',
          'Centro', 'cliente-inicial-test', $1, true
        )
        RETURNING "id"
      `,
      [city.id],
    );

    if (!client) {
      throw new Error('Test bootstrap fixture could not create the client.');
    }

    await dataSource.query(
      `
        INSERT INTO "clientes_idiomas" ("cliente_id", "idioma_id")
        SELECT $1, "id"
        FROM "idiomas"
        WHERE "codigo_idioma" = ANY($2::text[])
      `,
      [client.id, ['pt', 'en', 'es']],
    );

    const [profile] = await dataSource.query<Array<{ id: number }>>(
      `INSERT INTO "perfis" ("cliente_id", "eh_ativo", "eh_admin") VALUES ($1, true, true) RETURNING "id"`,
      [client.id],
    );

    if (!profile) {
      throw new Error('Test bootstrap fixture could not create the administrator profile.');
    }

    await dataSource.query(
      `
        INSERT INTO "perfis_traducoes" ("nome", "descricao", "perfil_id", "idioma_id")
        SELECT data."name", data."description", $1, language."id"
        FROM jsonb_to_recordset($2::jsonb)
          AS data("code" text, "name" text, "description" text)
        INNER JOIN "idiomas" language ON language."codigo_idioma" = data."code"
      `,
      [
        profile.id,
        JSON.stringify([
          { code: 'pt', description: 'Acesso administrativo de testes.', name: 'Administrador' },
          { code: 'en', description: 'Test administrative access.', name: 'Administrator' },
          { code: 'es', description: 'Acceso administrativo de pruebas.', name: 'Administrador' },
        ]),
      ],
    );

    const [user] = await dataSource.query<Array<{ id: number }>>(
      `SELECT "id" FROM "usuarios" WHERE "nome_usuario" = 'admin'`,
    );

    if (!user) {
      throw new Error('Test bootstrap fixture could not resolve the superuser.');
    }

    await dataSource.query(
      `INSERT INTO "usuarios_perfis" ("usuario_id", "cliente_id", "perfil_id") VALUES ($1, $2, $3)`,
      [user.id, client.id, profile.id],
    );

    const [module] = await dataSource.query<Array<{ id: number }>>(
      `
        INSERT INTO "modulos" ("cliente_id", "chave", "ordem", "eh_ativo")
        VALUES ($1, 'MOD_TEST0001', 0, true)
        RETURNING "id"
      `,
      [client.id],
    );

    if (!module) {
      throw new Error('Test bootstrap fixture could not create the administration module.');
    }

    await dataSource.query(
      `
        INSERT INTO "modulos_traducoes" ("nome", "descricao", "modulo_id", "idioma_id")
        SELECT data."name", data."description", $1, language."id"
        FROM jsonb_to_recordset($2::jsonb)
          AS data("code" text, "name" text, "description" text)
        INNER JOIN "idiomas" language ON language."codigo_idioma" = data."code"
      `,
      [
        module.id,
        JSON.stringify([
          { code: 'pt', description: 'Núcleo administrativo de testes.', name: 'Administração' },
          { code: 'en', description: 'Test administrative core.', name: 'Administration' },
          { code: 'es', description: 'Núcleo administrativo de pruebas.', name: 'Administración' },
        ]),
      ],
    );

    await dataSource.query(
      `
        INSERT INTO "funcionalidades" (
          "cliente_id", "modulo_id", "slug", "ordem", "eh_agrupador_navegacao", "eh_ativo"
        )
        SELECT $1, $2, data."slug", data."order", false, true
        FROM jsonb_to_recordset($3::jsonb) AS data("slug" text, "order" integer)
      `,
      [
        client.id,
        module.id,
        JSON.stringify(testFunctionalities.map(({ order, slug }) => ({ order, slug }))),
      ],
    );

    await dataSource.query(
      `
        INSERT INTO "funcionalidades_traducoes" ("nome", "descricao", "funcionalidade_id", "idioma_id")
        SELECT data."name", NULL, functionality."id", language."id"
        FROM jsonb_to_recordset($1::jsonb)
          AS data("code" text, "name" text, "slug" text)
        INNER JOIN "funcionalidades" functionality
          ON functionality."cliente_id" = $2
          AND functionality."slug" = data."slug"
        INNER JOIN "idiomas" language ON language."codigo_idioma" = data."code"
      `,
      [
        JSON.stringify(
          testFunctionalities.flatMap(({ names, slug }) =>
            ['pt', 'en', 'es'].map((code, index) => ({ code, name: names[index], slug })),
          ),
        ),
        client.id,
      ],
    );

    await dataSource.query(
      `
        INSERT INTO "funcionalidades_clientes_idiomas" ("cliente_id", "funcionalidade_id", "idioma_id")
        SELECT $1, functionality."id", language."id"
        FROM "funcionalidades" functionality
        CROSS JOIN "idiomas" language
        WHERE functionality."cliente_id" = $1
      `,
      [client.id],
    );
    await dataSource.query(
      `
        INSERT INTO "perfis_permissoes" ("perfil_id", "funcionalidade_id", "acao_id")
        SELECT $1, functionality."id", action."id"
        FROM "funcionalidades" functionality
        CROSS JOIN "acoes" action
        WHERE functionality."cliente_id" = $2
      `,
      [profile.id, client.id],
    );
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
    const [{ accessModels, accessModelTranslations, clients, functionalities, languages }] =
      await dataSource.query<
        {
          accessModels: string;
          accessModelTranslations: string;
          clients: string;
          functionalities: string;
          languages: string;
        }[]
      >(
        `
          SELECT
            (SELECT COUNT(*) FROM "modelos_acesso")::text AS "accessModels",
            (SELECT COUNT(*) FROM "modelos_acesso_traducoes")::text AS "accessModelTranslations",
            (SELECT COUNT(*) FROM "clientes")::text AS "clients",
            (SELECT COUNT(*) FROM "idiomas")::text AS "languages",
            (SELECT COUNT(*) FROM "funcionalidades")::text AS "functionalities"
        `,
      );

    if (
      accessModels !== '1' ||
      accessModelTranslations !== '3' ||
      clients !== '1' ||
      languages !== '3' ||
      functionalities !== '11'
    ) {
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
  await createTestBootstrapFixture();
  await assertBootstrapBaseline();
  await clearRedis();
  await clearUploads();

  return async (): Promise<void> => {
    await clearRedis();
    await clearUploads();
    await resetDatabase(false);
  };
};
