import type { MigrationInterface, QueryRunner } from 'typeorm';

import referenceDataSeed from '../seeds/1792142000000-core-reference-data.json';

export class CoreSeedReferenceData1792142000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const insertedLanguages = (await queryRunner.query(
      `
        INSERT INTO "idiomas" ("nome", "codigo_idioma", "codigo_regiao")
        SELECT data."name", data."code", data."region"
        FROM jsonb_to_recordset($1::jsonb) AS data("name" text, "code" text, "region" text)
        RETURNING "id", "codigo_idioma"
      `,
      [JSON.stringify(referenceDataSeed.languages)],
    )) as Array<{ codigo_idioma: string; id: number }>;

    if (insertedLanguages.length !== referenceDataSeed.languages.length) {
      throw new Error('Reference data seed did not create all languages.');
    }

    const insertedActions = (await queryRunner.query(
      `
        INSERT INTO "acoes" ("tipo")
        SELECT data."type"::"tipo_acao"
        FROM jsonb_to_recordset($1::jsonb) AS data("type" text)
        RETURNING "id", "tipo"
      `,
      [JSON.stringify(referenceDataSeed.actions.map(({ type }) => ({ type })))],
    )) as Array<{ id: number; tipo: string }>;

    if (insertedActions.length !== referenceDataSeed.actions.length) {
      throw new Error('Reference data seed did not create all actions.');
    }

    const languageIdByCode = new Map(
      insertedLanguages.map((language) => [language.codigo_idioma, language.id]),
    );
    const actionIdByType = new Map(insertedActions.map((action) => [action.tipo, action.id]));
    const translations = referenceDataSeed.actions.flatMap(({ translations: actionTranslations, type }) =>
      actionTranslations.map(({ description, locale, name }) => ({
        actionId: actionIdByType.get(type),
        code: locale,
        description,
        name,
      })),
    );

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
        SELECT data."name", data."description", data."actionId", language."id"
        FROM jsonb_to_recordset($1::jsonb)
          AS data("actionId" integer, "code" text, "description" text, "name" text)
        INNER JOIN "idiomas" language ON language."codigo_idioma" = data."code"
      `,
      [JSON.stringify(translations)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const actionTypes = referenceDataSeed.actions.map(({ type }) => type);
    const languageCodes = referenceDataSeed.languages.map(({ code }) => code);

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
