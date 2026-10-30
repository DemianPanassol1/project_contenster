'use client';

import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';

import { Order, type SortOption } from '../types/data-table-query.types';
import type { DataTableColumn } from '../types/DataTable.types';
import { getColumnKey, getColumnSelector } from '../utils/data-table.util';

interface DataTableHeaderProps<T extends object> {
  columns: DataTableColumn<T>[];
  rowActionsCount: number;
  selectable: boolean;
  allPageIds: Array<string | number>;
  selectedIds: Array<string | number>;
  sortBy: SortOption[];
  rowLeadingCell?: boolean;
  onSelectionChange: (ids: Array<string | number>) => void;
  onSort: (column: DataTableColumn<T>) => void;
}

export const DataTableHeader = <T extends object>({
  columns,
  rowActionsCount,
  selectable,
  allPageIds,
  selectedIds,
  sortBy,
  rowLeadingCell = false,
  onSelectionChange,
  onSort,
}: DataTableHeaderProps<T>) => {
  const t = useTranslations();
  const allPageSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  return (
    <TableHead>
      <TableRow
        sx={{
          bgcolor: 'action.hover',
          '& .MuiTableCell-root': {
            height: 40,
            fontSize: portalFontSize(12),
            fontWeight: 600,
            color: 'text.secondary',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            whiteSpace: 'nowrap',
          },
        }}
      >
        {rowLeadingCell && (
          <TableCell
            sx={{
              p: 0,
              width: 44,
              minWidth: 44,
              maxWidth: 44,
            }}
          />
        )}

        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              size="small"
              checked={allPageSelected}
              indeterminate={!allPageSelected && selectedIds.length > 0}
              onChange={(event) => {
                if (event.target.checked) {
                  onSelectionChange(Array.from(new Set([...selectedIds, ...allPageIds])));
                  return;
                }

                onSelectionChange(selectedIds.filter((id) => !allPageIds.includes(id)));
              }}
            />
          </TableCell>
        )}

        {columns.map((column) => {
          const columnKey = getColumnKey(column);
          const selector = getColumnSelector(column);
          const currentSort = sortBy.find((item) => item.field === selector);

          return (
            <TableCell key={columnKey} align={column.align} sx={{ width: column.width }}>
              {column.sortable ? (
                <TableSortLabel
                  active={Boolean(currentSort)}
                  direction={currentSort?.order === Order.DESC ? 'desc' : 'asc'}
                  onClick={() => onSort(column)}
                >
                  {column.name}
                </TableSortLabel>
              ) : (
                column.name
              )}
            </TableCell>
          );
        })}

        {!!rowActionsCount && (
          <TableCell align="center" sx={{ width: 64 }}>
            {t('data_table.actions')}
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
};
