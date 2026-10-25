import type { ReactNode } from 'react';
import type { DefaultValues, FieldPathByValue, FieldValues } from 'react-hook-form';

import type {
  DataTableAction,
  DataTableColumn,
  DataTableProps,
} from '@/shared/data-display/DataTable';
import type { OpenModalOptions } from '@/types/contexts';

export type CrudTableMode = 'create' | 'edit';

export interface CrudTableRenderFormParams<TRow extends FieldValues> {
  mode: CrudTableMode;
  row?: TRow;
}

export interface CrudTableModalConfig {
  createTitle?: string;
  editTitle?: string;
  cancelLabel?: string;
  saveLabel?: string;
  maxWidth?: OpenModalOptions['maxWidth'];
  fullWidth?: OpenModalOptions['fullWidth'];
  disableClose?: OpenModalOptions['disableClose'];
}

export interface CrudTableDeleteConfirmationConfig {
  cancelLabel?: string;
  confirmLabel?: string;
  message?: string;
  title?: string;
}

export type CrudTableDataTableProps<TRow extends FieldValues> = Omit<
  DataTableProps<TRow>,
  | 'actions'
  | 'bulkDeleteEndpoint'
  | 'columns'
  | 'data'
  | 'endpoint'
  | 'getRowEditPath'
  | 'getRowId'
  | 'onDeleteSuccess'
  | 'primaryAction'
  | 'rowComponent'
  | 'rows'
  | 'selectable'
  | 'selectedIds'
  | 'showPagination'
  | 'showRowDeleteAction'
  | 'showRowEditAction'
  | 'onSelectionChange'
>;

export interface CrudTableBaseProps<TForm extends FieldValues, TRow extends FieldValues> {
  name: FieldPathByValue<TForm, TRow[]>;
  columns: DataTableColumn<TRow>[];
  getRowId: (row: TRow) => string | number;
  defaultRow: TRow | (() => TRow);
  renderForm: (params: CrudTableRenderFormParams<TRow>) => ReactNode;
  /**
   * Allows the parent view to block row deletion.
   *
   * Return:
   * - true: allows deletion;
   * - false: blocks deletion silently;
   * - string: blocks deletion and shows the returned message as an error toast.
   */
  canDeleteRow?: (row: TRow, rows: TRow[]) => boolean | string;
  actions?: (false | DataTableAction<TRow>)[];
  modal?: CrudTableModalConfig;
  tableProps?: CrudTableDataTableProps<TRow>;
  createLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  deleteConfirmation?: CrudTableDeleteConfirmationConfig;
  showCreateAction?: boolean;
  showEditAction?: boolean | ((row: TRow) => boolean);
  showDeleteAction?: boolean | ((row: TRow) => boolean);
}

export type CrudTableSortableProps<TRow extends FieldValues> =
  | {
      sortable?: false;
      sortableField?: never;
    }
  | {
      sortable: true;
      sortableField: keyof TRow & string;
    };

export type CrudTableProps<
  TForm extends FieldValues,
  TRow extends FieldValues,
> = CrudTableBaseProps<TForm, TRow> & CrudTableSortableProps<TRow>;

export interface CrudTableModalFormProps<TRow extends FieldValues> {
  formId: string;
  mode: CrudTableMode;
  fields: DefaultValues<TRow>;
  row?: TRow;
  renderForm: (params: CrudTableRenderFormParams<TRow>) => ReactNode;
  onSubmit: (row: TRow) => void | Promise<void>;
}
