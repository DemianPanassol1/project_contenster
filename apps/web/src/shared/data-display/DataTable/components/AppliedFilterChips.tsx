'use client';

import { Box, Button, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';

import type { FilterOption } from '../types/data-table-query.types';
import type { DataTableColumn, FilterDisplayLabels } from '../types/DataTable.types';
import { getFilterColumn, getFilterDisplayValue } from '../utils/data-table.util';

interface AppliedFilterChipsProps<T extends object> {
  columns: DataTableColumn<T>[];
  filters: FilterOption[];
  fullWidth?: boolean;
  onRemove: (filter: FilterOption) => void;
  onClearAll: () => void;
}

export const AppliedFilterChips = <T extends object>({
  columns,
  filters,
  fullWidth = false,
  onRemove,
  onClearAll,
}: AppliedFilterChipsProps<T>) => {
  const t = useTranslations();
  const labels: FilterDisplayLabels = {
    yes: t('data_table.yes'),
    no: t('data_table.no'),
    from: t('data_table.from'),
    to: t('data_table.to'),
    fromValue: t('data_table.from_value'),
    upTo: t('data_table.up_to'),
  };

  if (!filters.length) {
    return null;
  }

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        minHeight: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        flexWrap: 'wrap',
      }}
    >
      {filters.map((filter, index) => {
        const column = getFilterColumn(columns, filter);
        const label = column?.name ?? filter.field;

        return (
          <Chip
            key={`${filter.field}-${filter.operation}-${String(filter.value)}-${index}`}
            size="small"
            label={`${label}: ${getFilterDisplayValue(filter, column, labels)}`}
            onDelete={() => onRemove(filter)}
            sx={{
              height: 28,
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              '& .MuiChip-label': {
                fontSize: 12,
              },
            }}
          />
        );
      })}

      {filters.length > 1 && (
        <Button
          size="small"
          variant="text"
          onClick={onClearAll}
          sx={{ height: 28, textTransform: 'none', fontSize: 12 }}
        >
          {t('data_table.clear_all')}
        </Button>
      )}
    </Box>
  );
};
