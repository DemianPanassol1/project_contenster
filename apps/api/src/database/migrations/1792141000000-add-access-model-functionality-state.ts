import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessModelFunctionalityState1792141000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Historical models always activated their functionalities on application.
    // Materialize that existing behavior when introducing the explicit field.
    await queryRunner.query(`UPDATE modelos_acesso SET estrutura = jsonb_set(estrutura, '{modules}', COALESCE((
      SELECT jsonb_agg(jsonb_set(module, '{functionalities}', COALESCE((
        SELECT jsonb_agg(CASE WHEN functionality ? 'isActive' THEN functionality ELSE functionality || '{"isActive":true}'::jsonb END)
        FROM jsonb_array_elements(module->'functionalities') functionality
      ), '[]'::jsonb))) FROM jsonb_array_elements(estrutura->'modules') module
    ), '[]'::jsonb))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE modelos_acesso SET estrutura = jsonb_set(estrutura, '{modules}', COALESCE((
      SELECT jsonb_agg(jsonb_set(module, '{functionalities}', COALESCE((
        SELECT jsonb_agg(functionality - 'isActive') FROM jsonb_array_elements(module->'functionalities') functionality
      ), '[]'::jsonb))) FROM jsonb_array_elements(estrutura->'modules') module
    ), '[]'::jsonb))`);
  }
}
