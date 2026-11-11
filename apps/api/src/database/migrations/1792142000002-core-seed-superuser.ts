import type { MigrationInterface, QueryRunner } from 'typeorm';

import superuserSeed from '../seeds/1792142000002-core-superuser.json';

export class CoreSeedSuperuser1792142000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = (await queryRunner.query(
      `
        INSERT INTO "usuarios" (
          "nome", "email", "nome_usuario", "telefone_principal", "telefone_secundario",
          "senha_hash", "eh_ativo", "eh_bloqueado", "eh_super_usuario", "ultimo_login_em", "imagem_id"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING "id"
      `,
      [
        superuserSeed.name,
        superuserSeed.email,
        superuserSeed.username,
        superuserSeed.phone,
        superuserSeed.secondaryPhone,
        superuserSeed.passwordHash,
        superuserSeed.isActive,
        superuserSeed.isBlocked,
        superuserSeed.isSuperuser,
        superuserSeed.lastLoginAt,
        superuserSeed.imageId,
      ],
    )) as Array<{ id: number }>;

    if (users.length !== 1) {
      throw new Error('Superuser seed did not create the bootstrap identity.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const users = (await queryRunner.query(
      `
        SELECT "id"
        FROM "usuarios"
        WHERE "nome" = $1
          AND "email" = $2
          AND "nome_usuario" = $3
          AND "telefone_principal" = $4
          AND "telefone_secundario" IS NOT DISTINCT FROM $5
          AND "senha_hash" = $6
          AND "eh_ativo" = $7
          AND "eh_bloqueado" = $8
          AND "eh_super_usuario" = $9
          AND "ultimo_login_em" IS NOT DISTINCT FROM $10
          AND "deletado_em" IS NULL
          AND "imagem_id" IS NOT DISTINCT FROM $11
      `,
      [
        superuserSeed.name,
        superuserSeed.email,
        superuserSeed.username,
        superuserSeed.phone,
        superuserSeed.secondaryPhone,
        superuserSeed.passwordHash,
        superuserSeed.isActive,
        superuserSeed.isBlocked,
        superuserSeed.isSuperuser,
        superuserSeed.lastLoginAt,
        superuserSeed.imageId,
      ],
    )) as Array<{ id: number }>;

    if (users.length !== 1) {
      throw new Error('Cannot revert the superuser seed after the identity was changed.');
    }

    const userId = users[0]!.id;
    const [{ count }] = (await queryRunner.query(
      `SELECT COUNT(*)::integer AS "count" FROM "usuarios_perfis" WHERE "usuario_id" = $1`,
      [userId],
    )) as Array<{ count: number }>;

    if (Number(count) > 0) {
      throw new Error('Cannot revert the superuser seed while it has profile links.');
    }

    await queryRunner.query(`DELETE FROM "usuarios" WHERE "id" = $1`, [userId]);
  }
}
