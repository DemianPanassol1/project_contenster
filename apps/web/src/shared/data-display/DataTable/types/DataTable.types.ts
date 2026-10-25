import type { TableRowProps } from '@mui/material';
import type { ComponentType, ReactNode } from 'react';

import type { OptionsBody, OptionsMethod } from '@/services/hooks';
import type { icons } from '@/shared/ui/Icon';

import type {
  FieldType,
  FilterOption,
  Operation,
  PaginationMeta,
  SortOption,
} from './data-table-query.types';

export type DataTableColumnType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'status'
  | 'icon'
  | 'image'
  | 'file'
  | 'custom';

export interface DataTableOption {
  label: string;
  value: string | number | boolean;
}

export interface DataTableColumn<T extends object> {
  name: string;
  /** Stable UI identity for columns that share the same field. Falls back to field. */
  columnId?: string;
  /** DTO path used to read the value rendered by the table. */
  field: string;
  /** Backend entity/relation path used in remote filters and sorting. Falls back to field. */
  selector?: string;
  /**
   * Derived UI value used by local rendering, filtering, sorting and export.
   * Falls back to field.
   */
  getValue?: (row: T) => unknown;
  sortable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  locked?: boolean;
  type?: DataTableColumnType;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  filter?: {
    type: FieldType;
    operation?: Operation;
    options?: DataTableOption[];
    optionsEndpoint?: string | null;
    optionsMethod?: OptionsMethod;
    optionsBody?: OptionsBody;
    revalidateOptions?: boolean;
    isLoadingOptions?: boolean;
  };
  renderCell?: (params: { row: T; value: unknown }) => ReactNode;
}

export interface DataTableAction<T extends object> {
  label: string;
  icon?: keyof typeof icons;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
  confirm?:
    | boolean
    | {
        cancelLabel?: string;
        confirmLabel?: string;
        title?: string;
        message?: string;
      };
  onClick: (row: T, rowId: string | number) => void | Promise<void>;
}

export interface DataTableDeleteConfirmationConfig {
  cancelLabel?: string;
  confirmLabel?: string;
  manyConfirmLabel?: string;
  selectionBarLabel?: string;
  title?: string;
  message?: string;
  manyMessage?: string;
}

export interface DataTableState<T extends object> {
  rows: T[];
  loading: boolean;
  meta?: PaginationMeta;
  page: number;
  perPage: number;
  sortBy: SortOption[];
  filters: FilterOption[];
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSortBy: (sortBy: SortOption[]) => void;
  setFilters: (filters: FilterOption[]) => void;
  refresh?: () => Promise<unknown> | void;
}

export interface DataTableRowProps<T extends object> {
  row: T;
  rowId: string | number;
  columns: DataTableColumn<T>[];
  actions: DataTableAction<T>[];
  selectable: boolean;
  selectedIds: Array<string | number>;
  onSelectionChange: (ids: Array<string | number>) => void;
  tableRowProps?: TableRowProps;
  leadingCell?: ReactNode;
}

export interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[];
  actions?: (false | DataTableAction<T>)[];
  endpoint?: string | null;
  bulkDeleteEndpoint?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  deleteConfirmation?: DataTableDeleteConfirmationConfig;
  showRowEditAction?: boolean;
  showRowDeleteAction?: boolean;
  getRowEditPath?: (row: T, rowId: string | number) => string | null | undefined;
  data?: T[];
  rows?: T[];
  loading?: boolean;
  meta?: PaginationMeta;
  page?: number;
  perPage?: number;
  sortBy?: SortOption[];
  filters?: FilterOption[];
  initialPage?: number;
  initialPerPage?: number;
  initialSortBy?: SortOption[];
  initialFilters?: FilterOption[];
  perPageOptions?: number[];
  getRowId?: (row: T) => string | number;
  primaryAction?: ReactNode;
  selectable?: boolean;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>) => void;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onSortChange?: (sortBy: SortOption[]) => void;
  onFiltersChange?: (filters: FilterOption[]) => void;
  onRefresh?: () => Promise<unknown> | void;
  onDeleteSuccess?: (ids: Array<string | number>) => void;
  rowComponent?: ComponentType<DataTableRowProps<T>>;
  rowLeadingCell?: boolean;
  showPagination?: boolean;
  emptyState?: ReactNode;
}

export interface UseDataTableRemoteParams<T extends object> {
  endpoint?: string | null;
  columns: DataTableColumn<T>[];
  initialPage?: number;
  initialPerPage?: number;
  initialSortBy?: SortOption[];
  initialFilters?: FilterOption[];
  revalidate?: boolean;
}

export interface UseDataTableLocalParams<T extends object> {
  data: T[];
  columns: DataTableColumn<T>[];
  initialPage?: number;
  initialPerPage?: number;
  initialSortBy?: SortOption[];
  initialFilters?: FilterOption[];
}

export interface FilterDisplayLabels {
  yes: string;
  no: string;
  from: string;
  to: string;
  fromValue: string;
  upTo: string;
}
