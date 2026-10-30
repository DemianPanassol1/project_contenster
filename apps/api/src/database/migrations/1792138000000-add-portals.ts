import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPortals1792138000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "arquivos" ALTER COLUMN "cliente_id" DROP NOT NULL`);
    await queryRunner.query(`CREATE TYPE "escala_fonte_portal" AS ENUM ('small', 'standard', 'large')`);
    await queryRunner.query(`CREATE TYPE "modo_header_login_portal" AS ENUM ('text', 'brand_asset')`);
    await queryRunner.query(`CREATE TYPE "layout_login_portal" AS ENUM ('centered', 'split')`);
    await queryRunner.query(`CREATE TYPE "posicao_midia_login_portal" AS ENUM ('left', 'right')`);
    await queryRunner.query(`CREATE TYPE "slot_midia_login_portal" AS ENUM ('centered_background_desktop', 'centered_background_mobile', 'split_panel_desktop', 'split_panel_mobile')`);
    await queryRunner.query(`CREATE TYPE "tipo_midia_login_portal" AS ENUM ('image', 'video')`);
    await queryRunner.query(`CREATE TABLE "portais" ("id" SERIAL NOT NULL, "nome_interno" varchar(100) NOT NULL, "cor_light_primary" char(7) NOT NULL, "cor_light_secondary" char(7) NOT NULL, "cor_light_background" char(7) NOT NULL, "cor_light_paper" char(7) NOT NULL, "cor_light_success" char(7) NOT NULL, "cor_light_warning" char(7) NOT NULL, "cor_light_error" char(7) NOT NULL, "cor_dark_primary" char(7) NOT NULL, "cor_dark_secondary" char(7) NOT NULL, "cor_dark_background" char(7) NOT NULL, "cor_dark_paper" char(7) NOT NULL, "cor_dark_success" char(7) NOT NULL, "cor_dark_warning" char(7) NOT NULL, "cor_dark_error" char(7) NOT NULL, "escala_fonte" "escala_fonte_portal" NOT NULL, "url_suporte" varchar(500), "modo_header_login" "modo_header_login_portal" NOT NULL, "layout_login" "layout_login_portal" NOT NULL, "posicao_midia_split" "posicao_midia_login_portal", "favicon_arquivo_id" integer, "icone_header_arquivo_id" integer, "brand_asset_arquivo_id" integer, "criado_em" timestamp NOT NULL DEFAULT now(), "atualizado_em" timestamp NOT NULL DEFAULT now(), CONSTRAINT "pk_portais" PRIMARY KEY ("id"), CONSTRAINT "ck_portais_nome_interno" CHECK (nullif(btrim("nome_interno"), '') IS NOT NULL), CONSTRAINT "ck_portais_header_login" CHECK (("modo_header_login" = 'text' AND "brand_asset_arquivo_id" IS NULL) OR ("modo_header_login" = 'brand_asset' AND "icone_header_arquivo_id" IS NULL AND "brand_asset_arquivo_id" IS NOT NULL)), CONSTRAINT "ck_portais_layout_login" CHECK (("layout_login" = 'split' AND "posicao_midia_split" IS NOT NULL) OR ("layout_login" = 'centered' AND "posicao_midia_split" IS NULL)))`);
    await queryRunner.query(`CREATE TABLE "portais_dominios" ("id" SERIAL NOT NULL, "host" varchar(253) NOT NULL, "portal_id" integer NOT NULL, CONSTRAINT "pk_portais_dominios" PRIMARY KEY ("id"), CONSTRAINT "ck_portais_dominios_host" CHECK ("host" = lower("host") AND "host" = btrim("host") AND ("host" ~ '^localhost(:([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$' OR "host" ~ '^\\[::1\\](:([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$' OR "host" !~ '[/?#:]')))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_portais_dominios_host" ON "portais_dominios" ("host")`);
    await queryRunner.query(`CREATE TABLE "portais_traducoes" ("id" SERIAL NOT NULL, "portal_id" integer NOT NULL, "idioma_id" integer NOT NULL, "nome_aplicacao" varchar(150), "descricao_aplicacao" varchar(500), "titulo_login" varchar(150), "descricao_login" varchar(500), "alt_brand_asset_login" varchar(250), "texto_suporte" varchar(250), CONSTRAINT "pk_portais_traducoes" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_portais_traducoes_portal_idioma" ON "portais_traducoes" ("portal_id", "idioma_id")`);
    await queryRunner.query(`CREATE TABLE "portais_midias_login" ("id" SERIAL NOT NULL, "portal_id" integer NOT NULL, "slot" "slot_midia_login_portal" NOT NULL, "tipo_midia" "tipo_midia_login_portal" NOT NULL, "arquivo_id" integer NOT NULL, "poster_arquivo_id" integer, CONSTRAINT "pk_portais_midias_login" PRIMARY KEY ("id"), CONSTRAINT "ck_portais_midias_login_poster" CHECK ("tipo_midia" = 'video' OR "poster_arquivo_id" IS NULL))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "uq_portais_midias_login_portal_slot" ON "portais_midias_login" ("portal_id", "slot")`);
    await queryRunner.query(`ALTER TABLE "portais" ADD CONSTRAINT "fk_portais_favicon_arquivo" FOREIGN KEY ("favicon_arquivo_id") REFERENCES "arquivos"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "portais" ADD CONSTRAINT "fk_portais_icone_header_arquivo" FOREIGN KEY ("icone_header_arquivo_id") REFERENCES "arquivos"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "portais" ADD CONSTRAINT "fk_portais_brand_asset_arquivo" FOREIGN KEY ("brand_asset_arquivo_id") REFERENCES "arquivos"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "portais_dominios" ADD CONSTRAINT "fk_portais_dominios_portal" FOREIGN KEY ("portal_id") REFERENCES "portais"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "portais_traducoes" ADD CONSTRAINT "fk_portais_traducoes_portal" FOREIGN KEY ("portal_id") REFERENCES "portais"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "portais_traducoes" ADD CONSTRAINT "fk_portais_traducoes_idioma" FOREIGN KEY ("idioma_id") REFERENCES "idiomas"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "portais_midias_login" ADD CONSTRAINT "fk_portais_midias_login_portal" FOREIGN KEY ("portal_id") REFERENCES "portais"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "portais_midias_login" ADD CONSTRAINT "fk_portais_midias_login_arquivo" FOREIGN KEY ("arquivo_id") REFERENCES "arquivos"("id") ON DELETE RESTRICT`);
    await queryRunner.query(`ALTER TABLE "portais_midias_login" ADD CONSTRAINT "fk_portais_midias_login_poster_arquivo" FOREIGN KEY ("poster_arquivo_id") REFERENCES "arquivos"("id") ON DELETE RESTRICT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "portais_midias_login"`);
    await queryRunner.query(`DROP TABLE "portais_traducoes"`);
    await queryRunner.query(`DROP TABLE "portais_dominios"`);
    await queryRunner.query(`DROP TABLE "portais"`);
    await queryRunner.query(`DROP TYPE "tipo_midia_login_portal"`);
    await queryRunner.query(`DROP TYPE "slot_midia_login_portal"`);
    await queryRunner.query(`DROP TYPE "posicao_midia_login_portal"`);
    await queryRunner.query(`DROP TYPE "layout_login_portal"`);
    await queryRunner.query(`DROP TYPE "modo_header_login_portal"`);
    await queryRunner.query(`DROP TYPE "escala_fonte_portal"`);
    await queryRunner.query(`DELETE FROM "arquivos" WHERE "cliente_id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "arquivos" ALTER COLUMN "cliente_id" SET NOT NULL`);
  }
}
