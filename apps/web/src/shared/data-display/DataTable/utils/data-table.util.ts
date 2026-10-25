import { icons } from '@/shared/ui/Icon';
import { toDisplayText } from '@/utils';

import {
  FieldType,
  type FilterOption,
  Operation,
  Order,
  type SortOption,
} from '../types/data-table-query.types';
import type { DataTableColumn, FilterDisplayLabels } from '../types/DataTable.types';

type RangeFilter = {
  from?: string;
  to?: string;
};

export type DataTableFilterDraftValue =
  string | number | boolean | Array<string | number | boolean> | RangeFilter | null | undefined;

export const getValueByPath = <T extends object>(item: T, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, item);
};

export const getColumnSelector = <T extends object>(column: DataTableColumn<T>): string => {
  return column.selector ?? column.field;
};

export const getColumnKey = <T extends object>(column: DataTableColumn<T>): string => {
  return column.columnId ?? column.field;
};

export const getColumnValue = <T extends object>(
  row: T,
  column: DataTableColumn<T> | undefined,
  fallbackField: string,
): unknown => {
  if (column?.getValue) {
    return column.getValue(row);
  }

  return getValueByPath(row, column?.field ?? fallbackField);
};

export const inferFilterType = <T extends object>(column: DataTableColumn<T>): FieldType => {
  if (column.filter?.type) {
    return column.filter.type;
  }

  switch (column.type) {
    case 'number':
      return FieldType.NUMBER;

    case 'date':
    case 'datetime':
      return FieldType.DATE;

    case 'boolean':
      return FieldType.BOOLEAN;

    case 'text':
    case 'icon':
    case 'image':
    case 'file':
    case 'status':
    case 'custom':
    default:
      return FieldType.STRING;
  }
};

export const inferFilterOperation = <T extends object>(
  column: DataTableColumn<T>,
  value?: DataTableFilterDraftValue,
): Operation => {
  if (column.filter?.operation) {
    return column.filter.operation;
  }

  if (Array.isArray(value)) {
    return Operation.IN;
  }

  switch (column.type) {
    case 'text':
    case 'file':
    case 'image':
    case 'icon':
      return Operation.LIKE;

    case 'date':
    case 'datetime':
      return Operation.EQUALS;

    case 'number':
    case 'boolean':
    case 'status':
    case 'custom':
    default:
      return Operation.EQUALS;
  }
};

export const isEmptyFilterValue = (value: DataTableFilterDraftValue): boolean => {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return !value.from && !value.to;
  }

  return false;
};

export const buildColumnFilter = <T extends object>(
  column: DataTableColumn<T>,
  value: DataTableFilterDraftValue,
): FilterOption | null => {
  if (isEmptyFilterValue(value)) {
    return null;
  }

  const type = inferFilterType(column);
  const field = getColumnSelector(column);

  if (column.type === 'number' && typeof value === 'object') {
    const range = value as RangeFilter;
    const from = range.from ? Number(range.from) : undefined;
    const to = range.to ? Number(range.to) : undefined;

    if (from !== undefined && to !== undefined) {
      return {
        field,
        value: [from, to],
        disjunctive: false,
        type,
        operation: Operation.BETWEEN,
      };
    }

    return {
      field,
      value: from ?? to,
      disjunctive: false,
      type,
      operation:
        from !== undefined ? Operation.GREATER_THAN_OR_EQUAL : Operation.LESS_THAN_OR_EQUAL,
    };
  }

  if ((column.type === 'date' || column.type === 'datetime') && typeof value === 'object') {
    const range = value as RangeFilter;

    if (range.from && range.to) {
      return {
        field,
        value: [range.from, range.to],
        disjunctive: false,
        type,
        operation: Operation.BETWEEN,
      };
    }

    return {
      field,
      value: range.from ?? range.to,
      disjunctive: false,
      type,
      operation: range.from ? Operation.GREATER_THAN_OR_EQUAL : Operation.LESS_THAN_OR_EQUAL,
    };
  }

  return {
    field,
    value: value as FilterOption['value'],
    disjunctive: false,
    type,
    operation: inferFilterOperation(column, value),
  };
};

export const buildSearchFilters = <T extends object>(
  columns: DataTableColumn<T>[],
  search: string,
): FilterOption[] => {
  const value = search.trim();

  if (!value) {
    return [];
  }

  return columns
    .filter((column) => column.searchable)
    .map((column) => ({
      field: getColumnSelector(column),
      value,
      disjunctive: true,
      type: inferFilterType(column),
      operation: Operation.LIKE,
    }));
};

export const buildDraftFilters = <T extends object>(
  columns: DataTableColumn<T>[],
  values: Record<string, DataTableFilterDraftValue>,
): FilterOption[] => {
  return columns
    .filter((column) => column.filterable)
    .map((column) => buildColumnFilter(column, values[getColumnKey(column)]))
    .filter((filter): filter is FilterOption => Boolean(filter));
};

export const getComparableValue = <T extends object>(
  row: T,
  column: DataTableColumn<T> | undefined,
  filterField: string,
): unknown => {
  return getColumnValue(row, column, filterField);
};

export const normalizeComparable = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  return toDisplayText(value).toLowerCase();
};

export const toComparableNumber = (value: unknown): number => {
  if (typeof value === 'string') {
    const date = Date.parse(value);

    if (!Number.isNaN(date) && /[-:T]/.test(value)) {
      return date;
    }
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return Number(value);
};

export const matchesFilter = <T extends object>(
  row: T,
  filter: FilterOption,
  column: DataTableColumn<T> | undefined,
): boolean => {
  const value = getComparableValue(row, column, filter.field);

  switch (filter.operation) {
    case Operation.LIKE:
      return normalizeComparable(value).includes(normalizeComparable(filter.value));

    case Operation.NOT_LIKE:
      return !normalizeComparable(value).includes(normalizeComparable(filter.value));

    case Operation.EQUALS:
      return String(value) === String(filter.value);

    case Operation.NOT_EQUALS:
      return String(value) !== String(filter.value);

    case Operation.IN:
      return Array.isArray(filter.value)
        ? filter.value.map(String).includes(String(value))
        : String(value) === String(filter.value);

    case Operation.NOT_IN:
      return Array.isArray(filter.value)
        ? !filter.value.map(String).includes(String(value))
        : String(value) !== String(filter.value);

    case Operation.GREATER_THAN:
      return toComparableNumber(value) > toComparableNumber(filter.value);

    case Operation.GREATER_THAN_OR_EQUAL:
      return toComparableNumber(value) >= toComparableNumber(filter.value);

    case Operation.LESS_THAN:
      return toComparableNumber(value) < toComparableNumber(filter.value);

    case Operation.LESS_THAN_OR_EQUAL:
      return toComparableNumber(value) <= toComparableNumber(filter.value);

    case Operation.BETWEEN:
      if (!Array.isArray(filter.value) || filter.value.length !== 2) return true;
      return (
        toComparableNumber(value) >= toComparableNumber(filter.value[0]) &&
        toComparableNumber(value) <= toComparableNumber(filter.value[1])
      );

    case Operation.IS_NULL:
      return value === null || value === undefined;

    case Operation.IS_NOT_NULL:
      return value !== null && value !== undefined;

    default:
      return true;
  }
};

export const filterLocalRows = <T extends object>(
  rows: T[],
  columns: DataTableColumn<T>[],
  filters: FilterOption[],
): T[] => {
  if (!filters.length) {
    return rows;
  }

  const columnBySelector = new Map(
    columns.map((column) => [getColumnSelector(column), column] as const),
  );
  const conjunctiveFilters = filters.filter((filter) => !filter.disjunctive);
  const disjunctiveFilters = filters.filter((filter) => filter.disjunctive);

  return rows.filter((row) => {
    const matchesAnd = conjunctiveFilters.every((filter) =>
      matchesFilter(row, filter, columnBySelector.get(filter.field)),
    );

    if (!matchesAnd) {
      return false;
    }

    if (!disjunctiveFilters.length) {
      return true;
    }

    return disjunctiveFilters.some((filter) =>
      matchesFilter(row, filter, columnBySelector.get(filter.field)),
    );
  });
};

export const sortLocalRows = <T extends object>(
  rows: T[],
  columns: DataTableColumn<T>[],
  sortBy: SortOption[],
): T[] => {
  if (!sortBy.length) {
    return rows;
  }

  const columnBySelector = new Map(
    columns.map((column) => [getColumnSelector(column), column] as const),
  );

  return [...rows].sort((left, right) => {
    for (const sort of sortBy) {
      const column = columnBySelector.get(sort.field);
      const leftValue = getComparableValue(left, column, sort.field);
      const rightValue = getComparableValue(right, column, sort.field);
      const direction = sort.order === Order.ASC ? 1 : -1;

      if (leftValue === rightValue) continue;
      if (leftValue === null || leftValue === undefined) return -1 * direction;
      if (rightValue === null || rightValue === undefined) return 1 * direction;

      return (
        toDisplayText(leftValue).localeCompare(toDisplayText(rightValue), undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * direction
      );
    }

    return 0;
  });
};

export const paginateLocalRows = <T>(rows: T[], page: number, perPage: number): T[] => {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * perPage;

  return rows.slice(start, start + perPage);
};

export const buildLocalMeta = (
  count: number,
  page: number,
  perPage: number,
  sortBy: SortOption[],
  filters: FilterOption[],
) => {
  const totalPages = Math.ceil(count / perPage);

  return {
    page,
    perPage,
    total: count,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    sortBy,
    filters,
  };
};

export const isIconName = (value: unknown): value is keyof typeof icons => {
  return typeof value === 'string' && value in icons;
};

export const formatCellText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toLocaleDateString();

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const label = record.originalName ?? record.name ?? record.label;

    if (label) {
      return toDisplayText(label);
    }
  }

  return toDisplayText(value);
};

export const getOptionLabel = <T extends object>(
  column: DataTableColumn<T>,
  value: unknown,
): string | null => {
  const option = column.filter?.options?.find((item) => String(item.value) === String(value));

  return option?.label ?? null;
};

export const formatColumnValue = <T extends object>(
  value: unknown,
  column: DataTableColumn<T>,
): string => {
  return getOptionLabel(column, value) ?? formatCellText(value);
};

export const getDefaultRowId = <T extends object>(row: T, index: number): string | number => {
  const id = (row as Record<string, unknown>).id;

  return typeof id === 'string' || typeof id === 'number' ? id : index;
};

export const buildCsv = <T extends object>(rows: T[], columns: DataTableColumn<T>[]): string => {
  const header = columns.map((column) => `"${column.name.replaceAll('"', '""')}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const value = getColumnValue(row, column, column.field);
          return `"${formatColumnValue(value, column).replaceAll('"', '""')}"`;
        })
        .join(','),
    )
    .join('\n');

  return [header, body].filter(Boolean).join('\n');
};

export const downloadCsv = (content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'data-table.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const getFilterColumn = <T extends object>(
  columns: DataTableColumn<T>[],
  filter: FilterOption,
): DataTableColumn<T> | undefined => {
  return columns.find(
    (column) => getColumnSelector(column) === filter.field || column.field === filter.field,
  );
};

export const getFilterDisplayValue = <T extends object>(
  filter: FilterOption,
  column: DataTableColumn<T> | undefined,
  labels: FilterDisplayLabels,
): string => {
  const mapOptionLabel = (value: unknown) => {
    const option = column ? getOptionLabel(column, value) : null;

    if (option) return option;
    if (typeof value === 'boolean') return value ? labels.yes : labels.no;

    return formatCellText(value);
  };

  if (filter.operation === Operation.BETWEEN && Array.isArray(filter.value)) {
    return `${labels.from} ${mapOptionLabel(filter.value[0])} ${labels.to} ${mapOptionLabel(filter.value[1])}`;
  }

  if (filter.operation === Operation.GREATER_THAN_OR_EQUAL) {
    return `${labels.fromValue} ${mapOptionLabel(filter.value)}`;
  }

  if (filter.operation === Operation.LESS_THAN_OR_EQUAL) {
    return `${labels.upTo} ${mapOptionLabel(filter.value)}`;
  }

  if (Array.isArray(filter.value)) {
    return filter.value.map(mapOptionLabel).join(', ');
  }

  return mapOptionLabel(filter.value);
};
