import type { MigrationInterface, QueryRunner } from 'typeorm';

import accessModelCatalogSeed from '../seeds/1792142000003-core-access-model-catalog.json';

const catalogLanguageCodes = accessModelCatalogSeed.translations.map(({ locale }) => locale);

export class CoreSeedAccessModelCatalog1792142000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const languages = (await queryRunner.query(
      `
        SELECT "id", "codigo_idioma"
        FROM "idiomas"
        WHERE "codigo_idioma" = ANY($1::text[])
      `,
      [catalogLanguageCodes],
    )) as Array<{ codigo_idioma: string; id: number }>;

    if (languages.length !== catalogLanguageCodes.length) {
      throw new Error('Access model catalog seed could not resolve all languages.');
    }

    const [accessModel] = (await queryRunner.query(
      `
        INSERT INTO "modelos_acesso" ("estrutura", "eh_ativo")
        VALUES ($1::jsonb, $2)
        RETURNING "id"
      `,
      [JSON.stringify(accessModelCatalogSeed.structure), accessModelCatalogSeed.isActive],
    )) as Array<{ id: number }>;

    if (!accessModel) {
      throw new Error('Access model catalog seed did not create the access model.');
    }

    const insertedTranslations = (await queryRunner.query(
      `
        INSERT INTO "modelos_acesso_traducoes" (
          "nome",
          "descricao",
          "modelo_acesso_id",
          "idioma_id"
        )
        SELECT
          data."name",
          data."description",
          $1,
          language."id"
        FROM jsonb_to_recordset($2::jsonb)
          AS data("locale" text, "name" text, "description" text)
        INNER JOIN "idiomas" language ON language."codigo_idioma" = data."locale"
        RETURNING "id"
      `,
      [accessModel.id, JSON.stringify(accessModelCatalogSeed.translations)],
    )) as Array<{ id: number }>;

    if (insertedTranslations.length !== accessModelCatalogSeed.translations.length) {
      throw new Error('Access model catalog seed did not create all translations.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const translationSnapshot = [...accessModelCatalogSeed.translations]
      .sort((left, right) => left.locale.localeCompare(right.locale))
      .map(({ description, locale, name }) => ({ description, locale, name }));
    const accessModels = (await queryRunner.query(
      `
        SELECT model."id"
        FROM "modelos_acesso" model
        WHERE model."estrutura" = $1::jsonb
          AND model."eh_ativo" = $2
          AND (
            SELECT jsonb_agg(
              jsonb_build_object(
                'description', translation."descricao",
                'locale', language."codigo_idioma",
                'name', translation."nome"
              )
              ORDER BY language."codigo_idioma"
            )
            FROM "modelos_acesso_traducoes" translation
            INNER JOIN "idiomas" language ON language."id" = translation."idioma_id"
            WHERE translation."modelo_acesso_id" = model."id"
          ) = $3::jsonb
      `,
      [
        JSON.stringify(accessModelCatalogSeed.structure),
        accessModelCatalogSeed.isActive,
        JSON.stringify(translationSnapshot),
      ],
    )) as Array<{ id: number }>;

    if (accessModels.length !== 1) {
      throw new Error('Cannot revert the access model catalog after it was changed.');
    }

    await queryRunner.query(`DELETE FROM "modelos_acesso" WHERE "id" = $1`, [accessModels[0]!.id]);
  }
}
