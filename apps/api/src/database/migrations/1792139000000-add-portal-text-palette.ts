import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPortalTextPalette1792139000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "portais" ADD "cor_light_text_primary" char(7) NOT NULL DEFAULT '#111827'`);
    await queryRunner.query(`ALTER TABLE "portais" ADD "cor_light_text_secondary" char(7) NOT NULL DEFAULT '#6B7280'`);
    await queryRunner.query(`ALTER TABLE "portais" ADD "cor_light_link" char(7) NOT NULL DEFAULT '#5B5BD6'`);
    await queryRunner.query(`ALTER TABLE "portais" ADD "cor_dark_text_primary" char(7) NOT NULL DEFAULT '#F8FAFC'`);
    await queryRunner.query(`ALTER TABLE "portais" ADD "cor_dark_text_secondary" char(7) NOT NULL DEFAULT '#94A3B8'`);
    await queryRunner.query(`ALTER TABLE "portais" ADD "cor_dark_link" char(7) NOT NULL DEFAULT '#A5B4FC'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "portais" DROP COLUMN "cor_dark_link"`);
    await queryRunner.query(`ALTER TABLE "portais" DROP COLUMN "cor_dark_text_secondary"`);
    await queryRunner.query(`ALTER TABLE "portais" DROP COLUMN "cor_dark_text_primary"`);
    await queryRunner.query(`ALTER TABLE "portais" DROP COLUMN "cor_light_link"`);
    await queryRunner.query(`ALTER TABLE "portais" DROP COLUMN "cor_light_text_secondary"`);
    await queryRunner.query(`ALTER TABLE "portais" DROP COLUMN "cor_light_text_primary"`);
  }
}
