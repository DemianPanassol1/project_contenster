import type {
  FieldType as ApiFieldType,
  FilterItem,
  FilterOperator,
  PaginatedBody,
  PaginationMeta,
  SortDirection,
  SortItem,
} from '@contenster/shared';

export type { PaginatedBody, PaginationMeta };

export const FieldType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
} as const satisfies Record<string, ApiFieldType>;

export type FieldType = ApiFieldType;

export const Operation = {
  LIKE: 'contains',
  EQUALS: 'equals',
  IN: 'in',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  BETWEEN: 'between',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',
  NOT_LIKE: 'contains',
  NOT_EQUALS: 'equals',
  NOT_IN: 'in',
} as const satisfies Record<string, FilterOperator>;

export type Operation = FilterOperator;

export const Order = {
  ASC: 'asc',
  DESC: 'desc',
} as const satisfies Record<string, SortDirection>;

export type Order = SortDirection;

export interface SortOption {
  field: string;
  order: SortDirection;
}

export interface FilterOption extends Omit<FilterItem, 'operator'> {
  disjunctive: boolean | null;
  operation: FilterOperator;
}

export const toApiSort = (sortBy: SortOption[]): SortItem[] =>
  sortBy.map((sort) => ({
    field: sort.field,
    direction: sort.order,
  }));

export const toApiFilters = (filters: FilterOption[]): FilterItem[] =>
  filters.map(({ operation, ...filter }) => ({
    ...filter,
    operator: operation,
  }));
