import { QueryFailedError } from 'typeorm';

interface PostgreSqlDriverError {
  code?: string;
  constraint?: string;
}

const getPostgreSqlDriverError = (error: unknown): PostgreSqlDriverError | null => {
  if (!(error instanceof QueryFailedError)) {
    return null;
  }

  return error.driverError as PostgreSqlDriverError;
};

export const getPostgreSqlUniqueConstraint = (error: unknown): string | null => {
  const driverError = getPostgreSqlDriverError(error);

  return driverError?.code === '23505' ? (driverError.constraint ?? null) : null;
};

export const isPostgreSqlUniqueViolation = (error: unknown, constraint: string): boolean =>
  getPostgreSqlUniqueConstraint(error) === constraint;

export const isPostgreSqlForeignKeyViolation = (error: unknown): boolean =>
  getPostgreSqlDriverError(error)?.code === '23503';
