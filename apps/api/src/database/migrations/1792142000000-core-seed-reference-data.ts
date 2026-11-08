import type { MigrationInterface, QueryRunner } from 'typeorm';

const languages = [
  { code: 'pt', name: 'Português (Brasil)', region: 'BR' },
  { code: 'en', name: 'English (United States)', region: 'US' },
  { code: 'es', name: 'Español (España)', region: 'ES' },
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

export class CoreSeedReferenceData1792142000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const insertedLanguages = (await queryRunner.query(
      `
        INSERT INTO "idiomas" ("nome", "codigo_idioma", "codigo_regiao")
        SELECT data."name", data."code", data."region"
        FROM jsonb_to_recordset($1::jsonb) AS data("name" text, "code" text, "region" text)
        RETURNING "id", "codigo_idioma"
      `,
      [JSON.stringify(languages)],
    )) as Array<{ codigo_idioma: string; id: number }>;

    if (insertedLanguages.length !== languages.length) {
      throw new Error('Reference data seed did not create all languages.');
    }

    const insertedActions = (await queryRunner.query(
      `
        INSERT INTO "acoes" ("tipo")
        SELECT data."type"::"tipo_acao"
        FROM jsonb_to_recordset($1::jsonb) AS data("type" text)
        RETURNING "id", "tipo"
      `,
      [JSON.stringify(actions.map(([type]) => ({ type })))],
    )) as Array<{ id: number; tipo: string }>;

    if (insertedActions.length !== actions.length) {
      throw new Error('Reference data seed did not create all actions.');
    }

    const languageIdByCode = new Map(
      insertedLanguages.map((language) => [language.codigo_idioma, language.id]),
    );
    const actionIdByType = new Map(insertedActions.map((action) => [action.tipo, action.id]));
    const translations = actions.flatMap(([type, pt, en, es]) => [
      { actionId: actionIdByType.get(type), code: 'pt', name: pt },
      { actionId: actionIdByType.get(type), code: 'en', name: en },
      { actionId: actionIdByType.get(type), code: 'es', name: es },
    ]);

    if (
      translations.some(
        (translation) => !translation.actionId || !languageIdByCode.get(translation.code),
      )
    ) {
      throw new Error('Reference data seed could not resolve action translations.');
    }

    await queryRunner.query(
      `
        INSERT INTO "acoes_traducoes" ("nome", "descricao", "acao_id", "idioma_id")
        SELECT data."name", NULL, data."actionId", language."id"
        FROM jsonb_to_recordset($1::jsonb)
          AS data("actionId" integer, "code" text, "name" text)
        INNER JOIN "idiomas" language ON language."codigo_idioma" = data."code"
      `,
      [JSON.stringify(translations)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const actionTypes = actions.map(([type]) => type);
    const languageCodes = languages.map(({ code }) => code);

    await queryRunner.query(
      `DELETE FROM "acoes" WHERE "tipo"::text = ANY($1::text[])`,
      [actionTypes],
    );
    await queryRunner.query(
      `DELETE FROM "idiomas" WHERE "codigo_idioma" = ANY($1::text[])`,
      [languageCodes],
    );
  }
}
