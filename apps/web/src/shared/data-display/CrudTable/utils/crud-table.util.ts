import { arrayMove } from '@dnd-kit/sortable';

export type CrudTableRowId = string | number;

export const normalizeCrudTableRows = <TRow extends object>(value: unknown): TRow[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((row): row is TRow => typeof row === 'object' && row !== null);
};

export const cloneCrudTableRow = <TRow extends object>(row: TRow): TRow => {
  return { ...row };
};

export const resolveDefaultRow = <TRow extends object>(defaultRow: TRow | (() => TRow)): TRow => {
  return cloneCrudTableRow(typeof defaultRow === 'function' ? defaultRow() : defaultRow);
};

export const isSameRowId = (left: CrudTableRowId, right: CrudTableRowId): boolean => {
  return String(left) === String(right);
};

const getSortableNumber = <TRow extends object>(
  row: TRow,
  sortableField: keyof TRow & string,
): number => {
  const value = Number(row[sortableField]);

  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
};

export const sortRowsBySortableField = <TRow extends object>(
  rows: TRow[],
  sortableField: keyof TRow & string,
): TRow[] => {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const sort =
        getSortableNumber(left.row, sortableField) - getSortableNumber(right.row, sortableField);

      return sort || left.index - right.index;
    })
    .map(({ row }) => row);
};

export const setSortableFieldValue = <TRow extends object>(
  row: TRow,
  sortableField: keyof TRow & string,
  value: number,
): TRow => {
  return {
    ...row,
    [sortableField]: value,
  };
};

export const reindexRows = <TRow extends object>(
  rows: TRow[],
  sortableField: keyof TRow & string,
): TRow[] => {
  return rows.map((row, index) => setSortableFieldValue(row, sortableField, index + 1));
};

export const normalizeSortableRows = <TRow extends object>(
  rows: TRow[],
  sortableField?: keyof TRow & string,
): TRow[] => {
  if (!sortableField) {
    return rows;
  }

  return reindexRows(sortRowsBySortableField(rows, sortableField), sortableField);
};

export const appendCrudTableRow = <TRow extends object>(
  rows: TRow[],
  row: TRow,
  sortableField?: keyof TRow & string,
): TRow[] => {
  if (!sortableField) {
    return [...rows, row];
  }

  const sortedRows = normalizeSortableRows(rows, sortableField);
  const nextRow = setSortableFieldValue(row, sortableField, sortedRows.length + 1);

  return [...sortedRows, nextRow];
};

export const replaceCrudTableRow = <TRow extends object>(
  rows: TRow[],
  row: TRow,
  rowId: CrudTableRowId,
  getRowId: (row: TRow) => CrudTableRowId,
  sortableField?: keyof TRow & string,
): TRow[] => {
  const currentRows = sortableField ? normalizeSortableRows(rows, sortableField) : rows;
  const index = currentRows.findIndex((item) => isSameRowId(getRowId(item), rowId));

  if (index < 0) {
    return currentRows;
  }

  const currentRow = currentRows[index];
  const nextRow = sortableField
    ? setSortableFieldValue(row, sortableField, Number(currentRow[sortableField]))
    : row;
  const nextRows = [...currentRows];

  nextRows[index] = nextRow;

  return nextRows;
};

export const removeCrudTableRow = <TRow extends object>(
  rows: TRow[],
  rowId: CrudTableRowId,
  getRowId: (row: TRow) => CrudTableRowId,
  sortableField?: keyof TRow & string,
): TRow[] => {
  const nextRows = rows.filter((row) => !isSameRowId(getRowId(row), rowId));

  return normalizeSortableRows(nextRows, sortableField);
};

export const moveCrudTableRow = <TRow extends object>(
  rows: TRow[],
  activeId: CrudTableRowId,
  overId: CrudTableRowId,
  getRowId: (row: TRow) => CrudTableRowId,
  sortableField: keyof TRow & string,
): TRow[] => {
  const sortedRows = normalizeSortableRows(rows, sortableField);
  const activeIndex = sortedRows.findIndex((row) => isSameRowId(getRowId(row), activeId));
  const overIndex = sortedRows.findIndex((row) => isSameRowId(getRowId(row), overId));

  if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
    return sortedRows;
  }

  return reindexRows(arrayMove(sortedRows, activeIndex, overIndex), sortableField);
};
