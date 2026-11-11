import type { MigrationInterface, QueryRunner } from 'typeorm';

import geographySeed from '../seeds/1792142000001-core-geography.json';

const stateSeed = geographySeed.country.states.map(({ cities, ...state }) => state);
const citySeed = geographySeed.country.states.flatMap(({ cities, code }) =>
  cities.map((city) => ({ ...city, uf: code })),
);

const serializeStates = (): string => JSON.stringify(stateSeed);
const serializeCities = (): string => JSON.stringify(citySeed);

const geographyLanguageCodes = geographySeed.country.translations.map(({ locale }) => locale);
const countryTranslations = JSON.stringify(geographySeed.country.translations);

export class CoreSeedGeography1792142000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const states = serializeStates();
    const cities = serializeCities();
    const languages = (await queryRunner.query(
      `
        SELECT "id", "codigo_idioma"
        FROM "idiomas"
        WHERE "codigo_idioma" = ANY($1::text[])
      `,
      [geographyLanguageCodes],
    )) as Array<{ codigo_idioma: string; id: number }>;

    if (languages.length !== geographyLanguageCodes.length) {
      throw new Error('Core geography seed requires the three baseline languages.');
    }

    const countries = (await queryRunner.query(
      `
        INSERT INTO "paises" (
          "iso2",
          "iso3",
          "codigo_telefone",
          "codigo_moeda",
          "locale",
          "eh_ativo"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING "id"
      `,
      [
        geographySeed.country.iso2,
        geographySeed.country.iso3,
        geographySeed.country.phoneCode,
        geographySeed.country.currencyCode,
        geographySeed.country.locale,
        geographySeed.country.isActive,
      ],
    )) as Array<{ id: number }>;
    const country = countries[0];

    if (!country) {
      throw new Error('Core geography seed could not create the configured country.');
    }

    await queryRunner.query(
      `
        INSERT INTO "paises_traducoes" ("pais_id", "idioma_id", "nome")
        SELECT $1, language."id", data."name"
        FROM jsonb_to_recordset($2::jsonb) AS data("locale" text, "name" text)
        JOIN "idiomas" language ON language."codigo_idioma" = data."locale"
      `,
      [country.id, countryTranslations],
    );

    const insertedStates = (await queryRunner.query(
      `
        INSERT INTO "estados" ("pais_id", "codigo", "eh_ativo")
        SELECT $1, data."code", data."isActive"
        FROM jsonb_to_recordset($2::jsonb)
          AS data("code" text, "name" text, "isActive" boolean)
        RETURNING "id"
      `,
      [country.id, states],
    )) as Array<{ id: number }>;

    if (insertedStates.length !== stateSeed.length) {
      throw new Error('Core geography seed did not create the expected states.');
    }

    await queryRunner.query(
      `
        WITH seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb)
            AS data("code" text, "name" text, "isActive" boolean)
        )
        INSERT INTO "estados_traducoes" ("estado_id", "idioma_id", "nome")
        SELECT state."id", language."id", seed."name"
        FROM seed
        JOIN "estados" state
          ON state."pais_id" = $2
          AND state."codigo" = seed."code"
        CROSS JOIN "idiomas" language
        WHERE language."codigo_idioma" = ANY($3::text[])
      `,
      [states, country.id, geographyLanguageCodes],
    );

    const insertedCities = (await queryRunner.query(
      `
        WITH seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text, "isActive" boolean)
        )
        INSERT INTO "cidades" ("estado_id", "codigo_ibge", "eh_ativo")
        SELECT state."id", seed."ibgeCode", seed."isActive"
        FROM seed
        JOIN "estados" state
          ON state."pais_id" = $2
          AND state."codigo" = seed."uf"
        RETURNING "id"
      `,
      [cities, country.id],
    )) as Array<{ id: number }>;

    if (insertedCities.length !== citySeed.length) {
      throw new Error('Core geography seed did not create the expected cities.');
    }

    await queryRunner.query(
      `
        WITH seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text, "isActive" boolean)
        )
        INSERT INTO "cidades_traducoes" ("cidade_id", "idioma_id", "nome")
        SELECT city."id", language."id", seed."name"
        FROM seed
        JOIN "cidades" city ON city."codigo_ibge" = seed."ibgeCode"
        CROSS JOIN "idiomas" language
        WHERE language."codigo_idioma" = ANY($2::text[])
      `,
      [cities, geographyLanguageCodes],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const states = serializeStates();
    const cities = serializeCities();
    const validation = (await queryRunner.query(
      `
        WITH country_translation_seed AS (
          SELECT *
          FROM jsonb_to_recordset($1::jsonb) AS data("locale" text, "name" text)
        ),
        state_seed AS (
          SELECT *
          FROM jsonb_to_recordset($2::jsonb)
            AS data("code" text, "name" text, "isActive" boolean)
        ),
        city_seed AS (
          SELECT *
          FROM jsonb_to_recordset($3::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text, "isActive" boolean)
        )
        SELECT
          (
            SELECT COUNT(*)::integer
            FROM "paises" country
            WHERE country."iso2" = $4
              AND country."iso3" = $5
              AND country."codigo_telefone" = $6
              AND country."codigo_moeda" = $7
              AND country."locale" = $8
              AND country."eh_ativo" = $9
              AND (
                SELECT COUNT(*)
                FROM "paises_traducoes" translation
                JOIN "idiomas" language ON language."id" = translation."idioma_id"
                JOIN country_translation_seed seed
                  ON seed."locale" = language."codigo_idioma"
                WHERE translation."pais_id" = country."id"
                  AND translation."nome" = seed."name"
              ) = (SELECT COUNT(*) FROM country_translation_seed)
              AND (
                SELECT COUNT(*)
                FROM "paises_traducoes" translation
                WHERE translation."pais_id" = country."id"
              ) = (SELECT COUNT(*) FROM country_translation_seed)
          ) AS "validCountries",
          (
            SELECT COUNT(*)::integer
            FROM state_seed
            JOIN "paises" country ON country."iso2" = $4
            JOIN "estados" state
              ON state."pais_id" = country."id"
              AND state."codigo" = state_seed."code"
            WHERE state."eh_ativo" = state_seed."isActive"
              AND (
                SELECT COUNT(*)
                FROM "estados_traducoes" translation
                WHERE translation."estado_id" = state."id"
                  AND translation."nome" = state_seed."name"
              ) = array_length($10::text[], 1)
              AND (
                SELECT COUNT(*)
                FROM "estados_traducoes" translation
                WHERE translation."estado_id" = state."id"
              ) = array_length($10::text[], 1)
          ) AS "validStates",
          (
            SELECT COUNT(*)::integer
            FROM city_seed
            JOIN "cidades" city ON city."codigo_ibge" = city_seed."ibgeCode"
            JOIN "estados" state
              ON state."id" = city."estado_id"
              AND state."codigo" = city_seed."uf"
            WHERE city."eh_ativo" = city_seed."isActive"
              AND (
                SELECT COUNT(*)
                FROM "cidades_traducoes" translation
                WHERE translation."cidade_id" = city."id"
                  AND translation."nome" = city_seed."name"
              ) = array_length($10::text[], 1)
              AND (
                SELECT COUNT(*)
                FROM "cidades_traducoes" translation
                WHERE translation."cidade_id" = city."id"
              ) = array_length($10::text[], 1)
          ) AS "validCities",
          (SELECT COUNT(*)::integer
            FROM "estados" state
            JOIN "paises" country ON country."id" = state."pais_id"
            WHERE country."iso2" = $4) AS "totalStates",
          (SELECT COUNT(*)::integer
            FROM "cidades" city
            JOIN "estados" state ON state."id" = city."estado_id"
            JOIN "paises" country ON country."id" = state."pais_id"
            WHERE country."iso2" = $4) AS "totalCities",
          (
            SELECT COUNT(*)::integer
            FROM "clientes" client
            JOIN "cidades" city ON city."id" = client."cidade_id"
            JOIN city_seed ON city_seed."ibgeCode" = city."codigo_ibge"
          ) AS "clientReferences"
      `,
      [
        countryTranslations,
        states,
        cities,
        geographySeed.country.iso2,
        geographySeed.country.iso3,
        geographySeed.country.phoneCode,
        geographySeed.country.currencyCode,
        geographySeed.country.locale,
        geographySeed.country.isActive,
        geographyLanguageCodes,
      ],
    )) as Array<{
      clientReferences: number;
      validCities: number;
      validCountries: number;
      validStates: number;
      totalCities: number;
      totalStates: number;
    }>;
    const result = validation[0];

    if (
      !result ||
      Number(result.validCountries) !== 1 ||
      Number(result.validStates) !== stateSeed.length ||
      Number(result.totalStates) !== stateSeed.length ||
      Number(result.validCities) !== citySeed.length ||
      Number(result.totalCities) !== citySeed.length
    ) {
      throw new Error('Cannot revert Core geography seed after seeded data was changed.');
    }

    if (Number(result.clientReferences) > 0) {
      throw new Error('Cannot revert Core geography seed while seeded cities are in use.');
    }

    await queryRunner.query(
      `
        DELETE FROM "cidades"
        WHERE "codigo_ibge" IN (
          SELECT data."ibgeCode"
          FROM jsonb_to_recordset($1::jsonb)
            AS data("uf" text, "ibgeCode" text, "name" text, "isActive" boolean)
        )
      `,
      [cities],
    );
    await queryRunner.query(
      `
        DELETE FROM "estados"
        WHERE "pais_id" = (SELECT "id" FROM "paises" WHERE "iso2" = $2)
          AND "codigo" IN (
            SELECT data."code"
            FROM jsonb_to_recordset($1::jsonb)
              AS data("code" text, "name" text, "isActive" boolean)
          )
      `,
      [states, geographySeed.country.iso2],
    );
    await queryRunner.query(
      `
        DELETE FROM "paises"
        WHERE "iso2" = $1
          AND "iso3" = $2
          AND "codigo_telefone" = $3
          AND "codigo_moeda" = $4
          AND "locale" = $5
          AND "eh_ativo" = $6
      `,
      [
        geographySeed.country.iso2,
        geographySeed.country.iso3,
        geographySeed.country.phoneCode,
        geographySeed.country.currencyCode,
        geographySeed.country.locale,
        geographySeed.country.isActive,
      ],
    );
  }
}
