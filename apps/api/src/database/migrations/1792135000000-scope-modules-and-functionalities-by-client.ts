import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScopeModulesAndFunctionalitiesByClient1792135000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "modulos" ADD COLUMN "cliente_id" integer`);
    await queryRunner.query(`UPDATE "modulos" SET "cliente_id" = 1 WHERE "cliente_id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "modulos" ALTER COLUMN "cliente_id" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "modulos" ADD CONSTRAINT "fk_modulos_cliente" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(`CREATE INDEX "idx_modulos_cliente" ON "modulos" ("cliente_id")`);

    await queryRunner.query(
      `UPDATE "funcionalidades" functionality
       SET "cliente_id" = module."cliente_id"
       FROM "modulos" module
       WHERE functionality."modulo_id" = module."id" AND functionality."cliente_id" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "funcionalidades" ALTER COLUMN "cliente_id" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "funcionalidades" ALTER COLUMN "cliente_id" DROP NOT NULL`);
    await queryRunner.query(`DROP INDEX "idx_modulos_cliente"`);
    await queryRunner.query(`ALTER TABLE "modulos" DROP CONSTRAINT "fk_modulos_cliente"`);
    await queryRunner.query(`ALTER TABLE "modulos" DROP COLUMN "cliente_id"`);
  }
}
