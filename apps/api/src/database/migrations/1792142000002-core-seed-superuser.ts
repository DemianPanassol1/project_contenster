import type { MigrationInterface, QueryRunner } from 'typeorm';

const superuser = {
  email: 'admin@contenster.local',
  name: 'Contenster Administrator',
  passwordHash:
    '$argon2id$v=19$m=65536,p=4,t=3$6WNyi5uZU3eVDU+MU4a9RQ$979CVRljry3iKh2OphJOrTlYXwiz0+4txEalhc/rYXI',
  phone: '00000000000',
  username: 'admin',
} as const;

export class CoreSeedSuperuser1792142000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = (await queryRunner.query(
      `
        INSERT INTO "usuarios" (
          "nome", "email", "nome_usuario", "telefone_principal", "telefone_secundario",
          "senha_hash", "eh_ativo", "eh_bloqueado", "eh_super_usuario", "ultimo_login_em", "imagem_id"
        )
        VALUES ($1, $2, $3, $4, NULL, $5, true, false, true, NULL, NULL)
        RETURNING "id"
      `,
      [
        superuser.name,
        superuser.email,
        superuser.username,
        superuser.phone,
        superuser.passwordHash,
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
          AND "telefone_secundario" IS NULL
          AND "senha_hash" = $5
          AND "eh_ativo" = true
          AND "eh_bloqueado" = false
          AND "eh_super_usuario" = true
          AND "ultimo_login_em" IS NULL
          AND "deletado_em" IS NULL
          AND "imagem_id" IS NULL
      `,
      [
        superuser.name,
        superuser.email,
        superuser.username,
        superuser.phone,
        superuser.passwordHash,
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
