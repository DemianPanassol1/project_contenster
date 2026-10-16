import type { MigrationInterface, QueryRunner } from 'typeorm';

const languages = [
  { id: 1, languageCode: 'pt', name: 'Português (Brasil)', regionCode: 'BR' },
  { id: 2, languageCode: 'en', name: 'English (United States)', regionCode: 'US' },
  { id: 3, languageCode: 'es', name: 'Español (España)', regionCode: 'ES' },
] as const;

const actions = [
  ['criar', 'Criar', 'Create', 'Crear'],
  ['editar', 'Editar', 'Edit', 'Editar'],
  ['excluir', 'Excluir', 'Delete', 'Eliminar'],
  ['visualizar', 'Visualizar', 'View', 'Visualizar'],
  ['exportar', 'Exportar', 'Export', 'Exportar'],
  ['importar', 'Importar', 'Import', 'Importar'],
  ['publicar', 'Publicar', 'Publish', 'Publicar'],
  ['despublicar', 'Despublicar', 'Unpublish', 'Despublicar'],
  ['ativar', 'Ativar', 'Activate', 'Activar'],
  ['desativar', 'Desativar', 'Deactivate', 'Desactivar'],
  ['aprovar', 'Aprovar', 'Approve', 'Aprobar'],
  ['reprovar', 'Reprovar', 'Reject', 'Rechazar'],
  ['enviar', 'Enviar', 'Send', 'Enviar'],
  ['receber', 'Receber', 'Receive', 'Recibir'],
  ['conceder', 'Conceder', 'Grant', 'Conceder'],
  ['revogar', 'Revogar', 'Revoke', 'Revocar'],
  ['iniciar', 'Iniciar', 'Start', 'Iniciar'],
  ['finalizar', 'Finalizar', 'Finish', 'Finalizar'],
  ['alterar_status', 'Alterar status', 'Change status', 'Cambiar estado'],
] as const;

const functionalities = [
  { id: 1, slug: 'clients', order: 0, names: ['Clientes', 'Clients', 'Clientes'] },
  { id: 2, slug: 'users', order: 1, names: ['Usuários', 'Users', 'Usuarios'] },
  { id: 3, slug: 'profiles', order: 2, names: ['Perfis', 'Profiles', 'Perfiles'] },
  { id: 4, slug: 'languages', order: 3, names: ['Idiomas', 'Languages', 'Idiomas'] },
] as const;

const adminPasswordHash =
  '$argon2id$v=19$m=65536,p=4,t=3$6WNyi5uZU3eVDU+MU4a9RQ$979CVRljry3iKh2OphJOrTlYXwiz0+4txEalhc/rYXI';

const setSequence = async (queryRunner: QueryRunner, table: string): Promise<void> => {
  await queryRunner.query(
    `SELECT setval(pg_get_serial_sequence($1, 'id'), (SELECT MAX("id") FROM ${table}), true)`,
    [table],
  );
};

export class BootstrapSlimCore1792129518442 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "idiomas" ("id", "nome", "codigo_idioma", "codigo_regiao")
       SELECT "id", "name", "languageCode", "regionCode"
       FROM jsonb_to_recordset($1::jsonb)
         AS data("id" integer, "name" text, "languageCode" text, "regionCode" text)`,
      [JSON.stringify(languages)],
    );

    await queryRunner.query(
      `INSERT INTO "acoes" ("id", "tipo")
       SELECT "id", "type"::"tipo_acao"
       FROM jsonb_to_recordset($1::jsonb) AS data("id" integer, "type" text)`,
      [JSON.stringify(actions.map(([type], index) => ({ id: index + 1, type })))],
    );

    await queryRunner.query(
      `INSERT INTO "acoes_traducoes" ("nome", "descricao", "acao_id", "idioma_id")
       SELECT "name", NULL, "actionId", "languageId"
       FROM jsonb_to_recordset($1::jsonb)
         AS data("name" text, "actionId" integer, "languageId" integer)`,
      [
        JSON.stringify(
          actions.flatMap(([, pt, en, es], index) => [
            { actionId: index + 1, languageId: 1, name: pt },
            { actionId: index + 1, languageId: 2, name: en },
            { actionId: index + 1, languageId: 3, name: es },
          ]),
        ),
      ],
    );

    await queryRunner.query(
      `INSERT INTO "paises" ("id", "iso2", "iso3", "codigo_telefone", "codigo_moeda", "locale", "eh_ativo")
       VALUES (1, 'BR', 'BRA', '55', 'BRL', 'pt-BR', true)`,
    );
    await queryRunner.query(
      `INSERT INTO "paises_traducoes" ("nome", "pais_id", "idioma_id")
       VALUES ('Brasil', 1, 1), ('Brazil', 1, 2), ('Brasil', 1, 3)`,
    );
    await queryRunner.query(
      `INSERT INTO "estados" ("id", "pais_id", "codigo", "eh_ativo") VALUES (1, 1, 'DF', true)`,
    );
    await queryRunner.query(
      `INSERT INTO "estados_traducoes" ("nome", "estado_id", "idioma_id")
       VALUES ('Distrito Federal', 1, 1), ('Federal District', 1, 2), ('Distrito Federal', 1, 3)`,
    );
    await queryRunner.query(
      `INSERT INTO "cidades" ("id", "estado_id", "codigo_ibge", "eh_ativo") VALUES (1, 1, '5300108', true)`,
    );
    await queryRunner.query(
      `INSERT INTO "cidades_traducoes" ("nome", "cidade_id", "idioma_id")
       VALUES ('Brasília', 1, 1), ('Brasília', 1, 2), ('Brasília', 1, 3)`,
    );

    await queryRunner.query(
      `INSERT INTO "modulos" ("id", "ordem", "eh_ativo") VALUES (1, 0, true)`,
    );
    await queryRunner.query(
      `INSERT INTO "modulos_traducoes" ("nome", "descricao", "modulo_id", "idioma_id")
       VALUES ('Administração', 'Núcleo administrativo.', 1, 1),
              ('Administration', 'Administrative core.', 1, 2),
              ('Administración', 'Núcleo administrativo.', 1, 3)`,
    );
    await queryRunner.query(
      `INSERT INTO "funcionalidades" ("id", "slug", "ordem", "eh_agrupador_navegacao", "eh_ativo", "modulo_id")
       SELECT "id", "slug", "order", false, true, 1
       FROM jsonb_to_recordset($1::jsonb) AS data("id" integer, "slug" text, "order" integer)`,
      [JSON.stringify(functionalities)],
    );
    await queryRunner.query(
      `INSERT INTO "funcionalidades_traducoes" ("nome", "descricao", "funcionalidade_id", "idioma_id")
       SELECT "name", NULL, "functionalityId", "languageId"
       FROM jsonb_to_recordset($1::jsonb)
         AS data("name" text, "functionalityId" integer, "languageId" integer)`,
      [
        JSON.stringify(
          functionalities.flatMap((functionality) =>
            functionality.names.map((name, index) => ({
              functionalityId: functionality.id,
              languageId: index + 1,
              name,
            })),
          ),
        ),
      ],
    );

    await queryRunner.query(
      `INSERT INTO "clientes" (
        "id", "razao_social", "nome_fantasia", "documento", "tipo_documento", "email",
        "telefone_principal", "endereco", "numero_endereco", "cep", "bairro", "slug", "cidade_id", "eh_ativo"
      ) VALUES (1, 'Cliente Inicial Ltda.', 'Cliente Inicial', '00000000000191', 'cnpj',
        'admin@cliente-inicial.local', '00000000000', 'Endereço inicial', '1', '70000000',
        'Centro', 'cliente-inicial', 1, true)`,
    );
    await queryRunner.query(
      `INSERT INTO "clientes_idiomas" ("id", "cliente_id", "idioma_id") VALUES (1, 1, 1), (2, 1, 2), (3, 1, 3)`,
    );
    await queryRunner.query(
      `INSERT INTO "funcionalidades_clientes_idiomas" ("id", "cliente_id", "funcionalidade_id", "idioma_id")
       SELECT row_number() OVER (), 1, functionality."id", language."id"
       FROM "funcionalidades" functionality CROSS JOIN "idiomas" language`,
    );
    await queryRunner.query(
      `INSERT INTO "perfis" ("id", "cliente_id", "eh_ativo") VALUES (1, 1, true)`,
    );
    await queryRunner.query(
      `INSERT INTO "perfis_traducoes" ("nome", "descricao", "perfil_id", "idioma_id")
       VALUES ('Administrador', 'Acesso administrativo completo.', 1, 1),
              ('Administrator', 'Full administrative access.', 1, 2),
              ('Administrador', 'Acceso administrativo completo.', 1, 3)`,
    );
    await queryRunner.query(
      `INSERT INTO "usuarios" (
        "id", "nome", "email", "nome_usuario", "telefone_principal", "senha_hash", "eh_ativo", "eh_bloqueado"
      ) VALUES (1, 'Administrador', 'admin@cliente-inicial.local', 'admin', $1, $2, true, false)`,
      ['00000000000', adminPasswordHash],
    );
    await queryRunner.query(
      `INSERT INTO "usuarios_perfis" ("id", "usuario_id", "cliente_id", "perfil_id") VALUES (1, 1, 1, 1)`,
    );
    await queryRunner.query(
      `INSERT INTO "perfis_permissoes" ("id", "perfil_id", "funcionalidade_id", "acao_id")
       SELECT row_number() OVER (), 1, functionality."id", action."id"
       FROM "funcionalidades" functionality CROSS JOIN "acoes" action`,
    );

    for (const table of [
      'idiomas', 'acoes', 'paises', 'estados', 'cidades', 'modulos', 'funcionalidades', 'clientes',
      'clientes_idiomas', 'funcionalidades_clientes_idiomas', 'perfis', 'usuarios', 'usuarios_perfis',
      'perfis_permissoes',
    ]) {
      await setSequence(queryRunner, table);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "perfis_permissoes" WHERE "perfil_id" = 1`);
    await queryRunner.query(`DELETE FROM "usuarios_perfis" WHERE "usuario_id" = 1 AND "cliente_id" = 1`);
    await queryRunner.query(`DELETE FROM "usuarios" WHERE "id" = 1 AND "nome_usuario" = 'admin'`);
    await queryRunner.query(`DELETE FROM "perfis" WHERE "id" = 1 AND "cliente_id" = 1`);
    await queryRunner.query(`DELETE FROM "funcionalidades_clientes_idiomas" WHERE "cliente_id" = 1`);
    await queryRunner.query(`DELETE FROM "clientes_idiomas" WHERE "cliente_id" = 1`);
    await queryRunner.query(`DELETE FROM "clientes" WHERE "id" = 1 AND "slug" = 'cliente-inicial'`);
    await queryRunner.query(`DELETE FROM "funcionalidades" WHERE "modulo_id" = 1`);
    await queryRunner.query(`DELETE FROM "modulos" WHERE "id" = 1`);
    await queryRunner.query(`DELETE FROM "cidades" WHERE "id" = 1`);
    await queryRunner.query(`DELETE FROM "estados" WHERE "id" = 1`);
    await queryRunner.query(`DELETE FROM "paises" WHERE "id" = 1`);
    await queryRunner.query(`DELETE FROM "acoes" WHERE "id" BETWEEN 1 AND ${actions.length}`);
    await queryRunner.query(`DELETE FROM "idiomas" WHERE "id" BETWEEN 1 AND ${languages.length}`);
  }
}
