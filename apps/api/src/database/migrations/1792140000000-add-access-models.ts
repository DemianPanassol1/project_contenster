import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessModels1792140000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "modulos" ADD COLUMN "chave" character varying(12)`);
    await queryRunner.query(
      `UPDATE "modulos" SET "chave" = 'MOD_' || LPAD(UPPER(TO_HEX("id")), 8, '0') WHERE "chave" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "modulos" ALTER COLUMN "chave" SET NOT NULL`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_modulos_cliente_chave" ON "modulos" ("cliente_id", "chave")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_funcionalidades_cliente_slug" ON "funcionalidades" ("cliente_id", "slug")`,
    );
    await queryRunner.query(
      `INSERT INTO "funcionalidades" ("cliente_id", "modulo_id", "slug", "ordem", "eh_agrupador_navegacao", "eh_ativo")
       SELECT 1, 1, 'access-models', 10, false, true
       WHERE NOT EXISTS (SELECT 1 FROM "funcionalidades" WHERE "cliente_id" = 1 AND "slug" = 'access-models')`,
    );
    await queryRunner.query(
      `INSERT INTO "funcionalidades_traducoes" ("funcionalidade_id", "idioma_id", "nome", "descricao")
       SELECT functionality."id", language."id", names."nome", NULL
       FROM "funcionalidades" functionality
       CROSS JOIN (VALUES ('pt', 'Modelos de acesso'), ('en', 'Access models'), ('es', 'Modelos de acceso')) AS names("codigo", "nome")
       INNER JOIN "idiomas" language ON language."codigo_idioma" = names."codigo"
       WHERE functionality."cliente_id" = 1 AND functionality."slug" = 'access-models'`,
    );
    await queryRunner.query(
      `INSERT INTO "funcionalidades_clientes_idiomas" ("cliente_id", "funcionalidade_id", "idioma_id")
       SELECT 1, functionality."id", clientLanguage."idioma_id"
       FROM "funcionalidades" functionality
       INNER JOIN "clientes_idiomas" clientLanguage ON clientLanguage."cliente_id" = 1
       WHERE functionality."cliente_id" = 1 AND functionality."slug" = 'access-models'`,
    );
    await queryRunner.query(
      `INSERT INTO "perfis_permissoes" ("perfil_id", "funcionalidade_id", "acao_id")
       SELECT profile."id", functionality."id", action."id"
       FROM "perfis" profile
       INNER JOIN "funcionalidades" functionality ON functionality."cliente_id" = profile."cliente_id" AND functionality."slug" = 'access-models'
       CROSS JOIN "acoes" action
       WHERE profile."cliente_id" = 1 AND profile."eh_admin" = true`,
    );
    await queryRunner.query(
      `CREATE TABLE "modelos_acesso" ("id" SERIAL NOT NULL, "estrutura" jsonb NOT NULL, "eh_ativo" boolean NOT NULL DEFAULT true, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_modelos_acesso" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "modelos_acesso_traducoes" ("id" SERIAL NOT NULL, "nome" character varying(75) NOT NULL, "descricao" character varying(255), "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(), "modelo_acesso_id" integer NOT NULL, "idioma_id" integer NOT NULL, CONSTRAINT "uq_modelos_acesso_traducoes_modelo_idioma" UNIQUE ("modelo_acesso_id", "idioma_id"), CONSTRAINT "pk_modelos_acesso_traducoes" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "modelos_acesso_traducoes" ADD CONSTRAINT "fk_modelos_acesso_traducoes_modelo" FOREIGN KEY ("modelo_acesso_id") REFERENCES "modelos_acesso"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "modelos_acesso_traducoes" ADD CONSTRAINT "fk_modelos_acesso_traducoes_idioma" FOREIGN KEY ("idioma_id") REFERENCES "idiomas"("id") ON DELETE RESTRICT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "modelos_acesso_traducoes" DROP CONSTRAINT "fk_modelos_acesso_traducoes_idioma"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modelos_acesso_traducoes" DROP CONSTRAINT "fk_modelos_acesso_traducoes_modelo"`,
    );

    await queryRunner.query(`DROP TABLE "modelos_acesso_traducoes"`);
    await queryRunner.query(`DROP TABLE "modelos_acesso"`);
    await queryRunner.query(
      `DELETE FROM "funcionalidades" WHERE "cliente_id" = 1 AND "slug" = 'access-models'`,
    );

    await queryRunner.query(`DROP INDEX "uq_funcionalidades_cliente_slug"`);
    await queryRunner.query(`DROP INDEX "uq_modulos_cliente_chave"`);
    await queryRunner.query(`ALTER TABLE "modulos" DROP COLUMN "chave"`);
  }
}
