import { useCallback, useMemo } from 'react';
import { type FieldPathByValue, type FieldValues, useFormContext, useWatch } from 'react-hook-form';

import {
  appendCrudTableRow,
  cloneCrudTableRow,
  type CrudTableRowId,
  moveCrudTableRow,
  normalizeCrudTableRows,
  normalizeSortableRows,
  removeCrudTableRow,
  replaceCrudTableRow,
} from '../utils/crud-table.util';

interface UseCrudTableFieldParams<TForm extends FieldValues, TRow extends FieldValues> {
  name: FieldPathByValue<TForm, TRow[]>;
  getRowId: (row: TRow) => CrudTableRowId;
  sortableField?: keyof TRow & string;
}

export const useCrudTableField = <TForm extends FieldValues, TRow extends FieldValues>({
  name,
  getRowId,
  sortableField,
}: UseCrudTableFieldParams<TForm, TRow>) => {
  const { control, setValue } = useFormContext<TForm>();
  const fieldValue = useWatch({ control, name });
  const rows = useMemo(
    () => normalizeSortableRows(normalizeCrudTableRows<TRow>(fieldValue), sortableField),
    [fieldValue, sortableField],
  );

  const commitRows = useCallback(
    (nextRows: TRow[]) => {
      setValue(name, nextRows as never, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [name, setValue],
  );

  const createRow = useCallback(
    (row: TRow) => {
      commitRows(appendCrudTableRow(rows, cloneCrudTableRow(row), sortableField));
    },
    [commitRows, rows, sortableField],
  );

  const updateRow = useCallback(
    (rowId: CrudTableRowId, row: TRow) => {
      commitRows(replaceCrudTableRow(rows, cloneCrudTableRow(row), rowId, getRowId, sortableField));
    },
    [commitRows, getRowId, rows, sortableField],
  );

  const deleteRow = useCallback(
    (rowId: CrudTableRowId) => {
      commitRows(removeCrudTableRow(rows, rowId, getRowId, sortableField));
    },
    [commitRows, getRowId, rows, sortableField],
  );

  const reorderRows = useCallback(
    (activeId: CrudTableRowId, overId: CrudTableRowId) => {
      if (!sortableField) {
        return;
      }

      commitRows(moveCrudTableRow(rows, activeId, overId, getRowId, sortableField));
    },
    [commitRows, getRowId, rows, sortableField],
  );

  return {
    rows,
    createRow,
    updateRow,
    deleteRow,
    reorderRows,
  };
};
