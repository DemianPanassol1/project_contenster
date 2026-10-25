'use client';

import { Box, CircularProgress, TableBody, TableCell, TableRow } from '@mui/material';
import type { ComponentType, ReactNode } from 'react';

import type { DataTableAction, DataTableColumn, DataTableRowProps } from '../types/DataTable.types';
import { getDefaultRowId } from '../utils/data-table.util';

import { DataTableEmptyState } from './DataTableEmptyState';
import { DataTableRow as DataTableBodyRow } from './DataTableRow';

interface DataTableBodyProps<T extends object> {
  rows: T[];
  loading: boolean;
  columns: DataTableColumn<T>[];
  actions: DataTableAction<T>[];
  selectable: boolean;
  selectedIds: Array<string | number>;
  getRowId?: (row: T) => string | number;
  onSelectionChange: (ids: Array<string | number>) => void;
  rowComponent?: ComponentType<DataTableRowProps<T>>;
  rowLeadingCell?: boolean;
  emptyState?: ReactNode;
}

export const DataTableBody = <T extends object>({
  rows,
  loading,
  columns,
  actions,
  selectable,
  selectedIds,
  getRowId,
  onSelectionChange,
  rowComponent,
  rowLeadingCell = false,
  emptyState,
}: DataTableBodyProps<T>) => {
  const RowComponent = rowComponent ?? DataTableBodyRow;
  const colSpan =
    columns.length + (rowLeadingCell ? 1 : 0) + (selectable ? 1 : 0) + (actions.length ? 1 : 0);

  return (
    <TableBody>
      {loading && (
        <TableRow>
          <TableCell colSpan={colSpan}>
            <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          </TableCell>
        </TableRow>
      )}

      {!loading && !rows.length && (
        <TableRow>
          <TableCell colSpan={colSpan}>{emptyState ?? <DataTableEmptyState />}</TableCell>
        </TableRow>
      )}

      {!loading &&
        rows.map((row, index) => {
          const rowId = getRowId ? getRowId(row) : getDefaultRowId(row, index);

          return (
            <RowComponent
              key={rowId}
              row={row}
              rowId={rowId}
              columns={columns}
              actions={actions}
              selectable={selectable}
              selectedIds={selectedIds}
              onSelectionChange={onSelectionChange}
            />
          );
        })}
    </TableBody>
  );
};
