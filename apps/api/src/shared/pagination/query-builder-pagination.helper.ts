import type {
  FieldType,
  FilterItem,
  PaginateRequest,
  SortDirection,
  SortItem,
} from '@contenster/shared';
import { Brackets, type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

type QueryFieldConfig = {
  /** SQL expression used when the client references this logical field. */
  expression: string;
  /** Allows this field to be used by explicit filters. Defaults to true. */
  filter?: boolean;
  /** Allows this field to be used by explicit sorting. Defaults to true. */
  sort?: boolean;
};

/** Maps transport field names to safe SQL expressions owned by each repository. */
export type QueryFieldMap = Record<string, string | QueryFieldConfig>;

type NormalizedQueryField = Required<QueryFieldConfig>;

export interface ApplyQueryPaginationOptions {
  /** Sort used when the request does not provide any valid sortable field. */
  defaultSort?: SortItem[];
  /** Per-endpoint whitelist for filters and sort. */
  fields: QueryFieldMap;
  /** Final stable order expression, usually the root entity primary key. */
  tieBreaker?: string;
}

/** Expands shorthand field declarations into the full internal config shape. */
const normalizeQueryField = (field: string | QueryFieldConfig): NormalizedQueryField => {
  if (typeof field === 'string') {
    return {
      expression: field,
      filter: true,
      sort: true,
    };
  }

  return {
    expression: field.expression,
    filter: field.filter ?? true,
    sort: field.sort ?? true,
  };
};

/** Normalizes every repository field declaration once before applying request operations. */
const normalizeQueryFields = (fields: QueryFieldMap): Record<string, NormalizedQueryField> =>
  Object.fromEntries(
    Object.entries(fields).map(([field, config]) => [field, normalizeQueryField(config)]),
  );

/** Converts primitive filter values to trimmed text for LIKE comparisons. */
const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return '';
};

/** Converts boolean-like transport values into booleans for typed filters. */
const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }

  return Boolean(value);
};

/** Converts filter values according to the field type sent by the DataTable contract. */
const normalizeValueByType = (value: unknown, type?: FieldType): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  switch (type) {
    case 'boolean':
      return parseBoolean(value);
    case 'date':
    case 'datetime':
      return value instanceof Date ? value : new Date(normalizeText(value));
    case 'number':
      return typeof value === 'number' ? value : Number(normalizeText(value));
    case 'string':
    default:
      return value;
  }
};

/** Applies type conversion to scalar or array filter values. */
const normalizeFilterValue = (filter: FilterItem): unknown => {
  if (Array.isArray(filter.value)) {
    return filter.value.map((value) => normalizeValueByType(value, filter.type ?? undefined));
  }

  return normalizeValueByType(filter.value, filter.type ?? undefined);
};

/** Detects filters that should be skipped because they carry no meaningful value. */
const isEmptyFilterValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return typeof value === 'string' && value.trim() === '';
};

/** Identifies operators that do not require a value from the request. */
const isNullOperator = (operator: FilterItem['operator']): boolean =>
  operator === 'is_null' || operator === 'is_not_null';

/** Builds a case-insensitive LIKE expression while keeping the value parameterized. */
const likeExpression = (expression: string, parameterName: string): string =>
  `LOWER(CAST(${expression} AS TEXT)) LIKE LOWER(:${parameterName})`;

/** Converts one whitelisted filter into SQL plus bound parameters. */
const buildFilterCondition = (
  filter: FilterItem,
  field: NormalizedQueryField,
  parameterName: string,
): { parameters: Record<string, unknown>; sql: string } | null => {
  if (isEmptyFilterValue(filter.value) && !isNullOperator(filter.operator)) {
    return null;
  }

  const expression = field.expression;
  const value = normalizeFilterValue(filter);

  // Convert the transport-level filter operator into a parameterized SQL condition.
  switch (filter.operator) {
    case 'contains':
      return {
        parameters: { [parameterName]: `%${normalizeText(value)}%` },
        sql: likeExpression(expression, parameterName),
      };
    case 'starts_with':
      return {
        parameters: { [parameterName]: `${normalizeText(value)}%` },
        sql: likeExpression(expression, parameterName),
      };
    case 'ends_with':
      return {
        parameters: { [parameterName]: `%${normalizeText(value)}` },
        sql: likeExpression(expression, parameterName),
      };
    case 'equals':
      return {
        parameters: { [parameterName]: value },
        sql: `${expression} = :${parameterName}`,
      };
    case 'gt':
      return {
        parameters: { [parameterName]: value },
        sql: `${expression} > :${parameterName}`,
      };
    case 'gte':
      return {
        parameters: { [parameterName]: value },
        sql: `${expression} >= :${parameterName}`,
      };
    case 'lt':
      return {
        parameters: { [parameterName]: value },
        sql: `${expression} < :${parameterName}`,
      };
    case 'lte':
      return {
        parameters: { [parameterName]: value },
        sql: `${expression} <= :${parameterName}`,
      };
    case 'between': {
      if (!Array.isArray(value) || value.length !== 2) {
        return null;
      }

      const [startValue, endValue] = value as [unknown, unknown];

      return {
        parameters: {
          [`${parameterName}End`]: endValue,
          [`${parameterName}Start`]: startValue,
        },
        sql: `${expression} BETWEEN :${parameterName}Start AND :${parameterName}End`,
      };
    }
    case 'in':
      return {
        parameters: { [parameterName]: Array.isArray(value) ? value : [value] },
        sql: `${expression} IN (:...${parameterName})`,
      };
    case 'is_null':
      return {
        parameters: {},
        sql: `${expression} IS NULL`,
      };
    case 'is_not_null':
      return {
        parameters: {},
        sql: `${expression} IS NOT NULL`,
      };
    default:
      return null;
  }
};

const applyFilters = <Entity extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<Entity>,
  request: PaginateRequest,
  fields: Record<string, NormalizedQueryField>,
): void => {
  const filters = request.pagination.filters ?? [];
  const conjunctiveFilters = filters.filter((filter) => !filter.disjunctive);
  const disjunctiveFilters = filters.filter((filter) => filter.disjunctive);

  for (const [index, filter] of conjunctiveFilters.entries()) {
    const field = fields[filter.field];

    // Unknown or non-filterable fields are ignored instead of becoming SQL.
    if (!field?.filter) {
      continue;
    }

    const condition = buildFilterCondition(filter, field, `filter${index}`);

    if (condition) {
      queryBuilder.andWhere(condition.sql, condition.parameters);
    }
  }

  const disjunctiveConditions = disjunctiveFilters
    .map((filter, index) => {
      const field = fields[filter.field];

      if (!field?.filter) {
        return null;
      }

      return buildFilterCondition(filter, field, `orFilter${index}`);
    })
    .filter((condition): condition is { parameters: Record<string, unknown>; sql: string } =>
      Boolean(condition),
    );

  if (!disjunctiveConditions.length) {
    return;
  }

  queryBuilder.andWhere(
    new Brackets((bracket) => {
      disjunctiveConditions.forEach((condition, index) => {
        if (index === 0) {
          bracket.where(condition.sql, condition.parameters);
          return;
        }

        bracket.orWhere(condition.sql, condition.parameters);
      });
    }),
  );
};

/** Converts the shared sort direction into TypeORM's expected order token. */
const normalizeDirection = (direction: SortDirection): 'ASC' | 'DESC' =>
  direction === 'desc' ? 'DESC' : 'ASC';

/** Checks whether an expression can be safely ordered directly as alias.column. */
const isSimpleColumnExpression = (expression: string): boolean =>
  /^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(expression);

/** Adds one ORDER BY clause, selecting computed expressions under a generated alias. */
const addSort = <Entity extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<Entity>,
  expression: string,
  direction: SortDirection,
  index: number,
): void => {
  if (isSimpleColumnExpression(expression)) {
    queryBuilder.addOrderBy(expression, normalizeDirection(direction));
    return;
  }

  // Computed expressions must be selected under an alias before TypeORM can sort by them.
  const alias = `pagination_sort_${index}`;

  queryBuilder.addSelect(expression, alias);
  queryBuilder.addOrderBy(alias, normalizeDirection(direction));
};

/** Applies request sorting, falls back to default sorting, then appends a stable tie-breaker. */
const applySort = <Entity extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<Entity>,
  request: PaginateRequest,
  fields: Record<string, NormalizedQueryField>,
  options: ApplyQueryPaginationOptions,
): void => {
  let appliedSort = false;

  for (const [index, sort] of (request.pagination.sort ?? []).entries()) {
    const field = fields[sort.field];

    if (!field?.sort) {
      continue;
    }

    addSort(queryBuilder, field.expression, sort.direction, index);
    appliedSort = true;
  }

  if (!appliedSort) {
    for (const [index, sort] of (options.defaultSort ?? []).entries()) {
      const field = fields[sort.field];

      if (!field?.sort) {
        continue;
      }

      addSort(queryBuilder, field.expression, sort.direction, index);
      appliedSort = true;
    }
  }

  if (options.tieBreaker) {
    queryBuilder.addOrderBy(options.tieBreaker, 'ASC');
  }
};

/** Applies whitelisted filters, sorting, and one-based pagination to a QueryBuilder. */
export const applyPaginatedQueryBuilder = async <Entity extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<Entity>,
  request: PaginateRequest,
  options: ApplyQueryPaginationOptions,
): Promise<[Entity[], number]> => {
  const fields = normalizeQueryFields(options.fields);
  const page = Math.max(1, request.pagination.page);
  const perPage = Math.max(1, request.pagination.perPage);

  // Repositories provide the field whitelist; this helper only applies allowed operations.
  applyFilters(queryBuilder, request, fields);
  applySort(queryBuilder, request, fields, options);

  // The API pagination contract is one-based, so page 1 starts at offset 0.
  queryBuilder.take(perPage);
  queryBuilder.skip((page - 1) * perPage);

  return queryBuilder.getManyAndCount();
};
