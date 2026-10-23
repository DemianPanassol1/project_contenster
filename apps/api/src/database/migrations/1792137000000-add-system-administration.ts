import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemAdministration1792137000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuarios" ADD COLUMN "eh_super_usuario" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "perfis" ADD COLUMN "eh_admin" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`UPDATE "perfis" SET "eh_admin" = true WHERE "id" = 1 AND "cliente_id" = 1`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_perfis_cliente_eh_admin" ON "perfis" ("cliente_id") WHERE "eh_admin" = true`,
    );
    await queryRunner.query(`CREATE TYPE "tipo_acesso_log_requisicao" AS ENUM ('client', 'superuser')`);
    await queryRunner.query(`ALTER TABLE "logs_requisicoes" ADD COLUMN "tipo_acesso" "tipo_acesso_log_requisicao" NOT NULL DEFAULT 'client'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "logs_requisicoes" DROP COLUMN "tipo_acesso"`);
    await queryRunner.query(`DROP TYPE "tipo_acesso_log_requisicao"`);
    await queryRunner.query(`DROP INDEX "uq_perfis_cliente_eh_admin"`);
    await queryRunner.query(`ALTER TABLE "perfis" DROP COLUMN "eh_admin"`);
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "eh_super_usuario"`);
  }
}
