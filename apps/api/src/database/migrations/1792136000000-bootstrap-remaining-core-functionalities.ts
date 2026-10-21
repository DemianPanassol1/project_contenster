import type { MigrationInterface, QueryRunner } from 'typeorm';

const functionalities = [
  ['actions', 4, 'Ações', 'Actions', 'Acciones'],
  ['modules', 5, 'Módulos', 'Modules', 'Módulos'],
  ['functionalities', 6, 'Funcionalidades', 'Functionalities', 'Funcionalidades'],
  ['countries', 7, 'Países', 'Countries', 'Países'],
  ['states', 8, 'Estados', 'States', 'Estados'],
  ['cities', 9, 'Cidades', 'Cities', 'Ciudades'],
  ['client-storage', 10, 'Armazenamento', 'Storage', 'Almacenamiento'],
  ['client-logs', 11, 'Logs', 'Logs', 'Registros'],
] as const;

export class BootstrapRemainingCoreFunctionalities1792136000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [slug, order] of functionalities) {
      await queryRunner.query(
        `INSERT INTO "funcionalidades" ("cliente_id", "modulo_id", "slug", "ordem", "eh_agrupador_navegacao", "eh_ativo")
         VALUES (1, 1, $1, $2, false, true)`,
        [slug, order],
      );
    }

    await queryRunner.query(
      `INSERT INTO "funcionalidades_traducoes" ("nome", "descricao", "funcionalidade_id", "idioma_id")
       SELECT item."name", NULL, functionality."id", item."languageId"
       FROM jsonb_to_recordset($1::jsonb) AS item("slug" text, "languageId" integer, "name" text)
       INNER JOIN "funcionalidades" functionality ON functionality."slug" = item."slug" AND functionality."cliente_id" = 1`,
      [JSON.stringify(functionalities.flatMap(([slug, , pt, en, es]) => [
        { slug, languageId: 1, name: pt },
        { slug, languageId: 2, name: en },
        { slug, languageId: 3, name: es },
      ]))],
    );

    await queryRunner.query(
      `INSERT INTO "funcionalidades_clientes_idiomas" ("cliente_id", "funcionalidade_id", "idioma_id")
       SELECT 1, functionality."id", language."id"
       FROM "funcionalidades" functionality CROSS JOIN "idiomas" language
       WHERE functionality."cliente_id" = 1 AND functionality."slug" = ANY($1)`,
      [functionalities.map(([slug]) => slug)],
    );

    await queryRunner.query(
      `INSERT INTO "perfis_permissoes" ("perfil_id", "funcionalidade_id", "acao_id")
       SELECT 1, functionality."id", action."id"
       FROM "funcionalidades" functionality CROSS JOIN "acoes" action
       WHERE functionality."cliente_id" = 1 AND functionality."slug" = ANY($1)`,
      [functionalities.map(([slug]) => slug)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = functionalities.map(([slug]) => slug);
    await queryRunner.query(
      `DELETE FROM "perfis_permissoes"
       WHERE "perfil_id" = 1 AND "funcionalidade_id" IN (
         SELECT "id" FROM "funcionalidades" WHERE "cliente_id" = 1 AND "slug" = ANY($1)
       )`,
      [slugs],
    );
    await queryRunner.query(
      `DELETE FROM "funcionalidades" WHERE "cliente_id" = 1 AND "slug" = ANY($1)`,
      [slugs],
    );
  }
}
