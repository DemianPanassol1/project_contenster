export type SortDirection = 'asc' | 'desc';

export interface SortItem {
  direction: SortDirection;
  field: string;
}

export type FieldType = 'boolean' | 'date' | 'datetime' | 'number' | 'string';

export type FilterOperator =
  | 'between'
  | 'contains'
  | 'ends_with'
  | 'equals'
  | 'gt'
  | 'gte'
  | 'in'
  | 'is_not_null'
  | 'is_null'
  | 'lt'
  | 'lte'
  | 'starts_with';

export interface FilterItem {
  disjunctive?: boolean | null;
  field: string;
  operator: FilterOperator;
  type?: FieldType | null;
  value?: unknown;
}

export interface PaginationRequest {
  filters?: FilterItem[];
  page: number;
  perPage: number;
  sort?: SortItem[];
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedBody<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}

export interface OptionRequest {
  isOptional?: boolean | null;
  pagination: PaginationRequest;
}
