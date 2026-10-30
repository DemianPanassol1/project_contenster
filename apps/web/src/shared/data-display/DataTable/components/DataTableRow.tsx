'use client';

import { Checkbox, TableCell, TableRow } from '@mui/material';

import { portalFontSize } from '@/core/theme';
import { toSxArray } from '@/utils';

import type { DataTableRowProps } from '../types/DataTable.types';
import { getColumnKey, getColumnValue } from '../utils/data-table.util';

import { DataTableCell } from './DataTableCell';
import { DataTableRowActions } from './DataTableRowActions';

export const DataTableRow = <T extends object>({
  row,
  rowId,
  columns,
  actions,
  selectable,
  selectedIds,
  onSelectionChange,
  tableRowProps,
  leadingCell,
}: DataTableRowProps<T>) => {
  const { sx: tableRowSx, ...currentTableRowProps } = tableRowProps ?? {};

  return (
    <TableRow
      {...currentTableRowProps}
      hover
      sx={[
        {
          '& .MuiTableCell-root': {
            height: 44,
            fontSize: portalFontSize(13),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          },
        },
        ...toSxArray(tableRowSx),
      ]}
    >
      {leadingCell && (
        <TableCell
          sx={{
            width: 44,
            minWidth: 44,
            maxWidth: 44,
            p: '0 8px 0 2px',
            lineHeight: 0,
            boxSizing: 'border-box',
          }}
        >
          {leadingCell}
        </TableCell>
      )}

      {selectable && (
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            checked={selectedIds.includes(rowId)}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectionChange([...selectedIds, rowId]);
                return;
              }

              onSelectionChange(selectedIds.filter((id) => id !== rowId));
            }}
          />
        </TableCell>
      )}

      {columns.map((column) => {
        const columnKey = getColumnKey(column);
        const value = getColumnValue(row, column, column.field);

        return (
          <TableCell key={columnKey} align={column.align}>
            <DataTableCell row={row} column={column} value={value} />
          </TableCell>
        );
      })}

      {!!actions.length && (
        <TableCell align="right">
          <DataTableRowActions row={row} rowId={rowId} actions={actions} />
        </TableCell>
      )}
    </TableRow>
  );
};
