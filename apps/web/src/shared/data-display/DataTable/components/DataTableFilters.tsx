'use client';

import {
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Icon } from '@/shared/ui/Icon';

import type { FilterOption } from '../types/data-table-query.types';
import type { DataTableColumn } from '../types/DataTable.types';
import {
  buildDraftFilters,
  type DataTableFilterDraftValue,
  getColumnKey,
} from '../utils/data-table.util';

interface DataTableFiltersProps<T extends object> {
  columns: DataTableColumn<T>[];
  activeFiltersCount: number;
  onApply: (filters: FilterOption[]) => void;
}

const toSelectValue = (value: DataTableFilterDraftValue): string => {
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;

  return '';
};

const parseOptionValue = (
  rawValue: string,
  options: Array<{ value: string | number | boolean }>,
) => {
  const option = options.find((item) => String(item.value) === rawValue);

  return option?.value ?? rawValue;
};

const getRangeValue = (value: DataTableFilterDraftValue): { from?: string; to?: string } => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  return {};
};

export const DataTableFilters = <T extends object>({
  columns,
  activeFiltersCount,
  onApply,
}: DataTableFiltersProps<T>) => {
  const t = useTranslations();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<Record<string, DataTableFilterDraftValue>>({});

  const filterableColumns = useMemo(() => columns.filter((column) => column.filterable), [columns]);

  if (!filterableColumns.length) {
    return null;
  }

  const handleApply = () => {
    onApply(buildDraftFilters(filterableColumns, draft));
    setAnchorEl(null);
  };

  const handleReset = () => {
    setDraft({});
    onApply([]);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Icon name="funnel" size={16} />}
        endIcon={
          activeFiltersCount > 0 ? (
            <Chip
              size="small"
              label={activeFiltersCount}
              sx={{ height: 20, borderRadius: 1, fontSize: 11 }}
            />
          ) : undefined
        }
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          height: 36,
          borderRadius: 1.5,
          px: 1.25,
          fontSize: 12.5,
          fontWeight: 500,
          color: 'text.primary',
          borderColor: 'divider',
          textTransform: 'none',
        }}
      >
        {t('data_table.filters')}
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 1.5,
              width: 360,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => theme.shadows[4],
            },
          },
        }}
      >
        <Typography sx={{ mb: 1.5, fontSize: 13, fontWeight: 600 }}>
          {t('data_table.filters')}
        </Typography>

        <Box sx={{ display: 'grid', gap: 1.25 }}>
          {filterableColumns.map((column) => {
            const columnKey = getColumnKey(column);
            const options =
              column.filter?.options ??
              (column.type === 'boolean'
                ? [
                    { label: t('data_table.yes'), value: true },
                    { label: t('data_table.no'), value: false },
                  ]
                : undefined);
            const isLoadingOptions = Boolean(column.filter?.isLoadingOptions);
            const shouldRenderOptions = Boolean(
              options?.length || isLoadingOptions || column.type === 'boolean',
            );

            if (shouldRenderOptions) {
              return (
                <FormControl
                  key={columnKey}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': { height: 40 },
                    '& .MuiSelect-select': {
                      alignItems: 'center',
                      display: 'flex',
                      fontSize: 14,
                      py: 0,
                    },
                  }}
                >
                  <Select
                    disabled={isLoadingOptions}
                    displayEmpty
                    value={toSelectValue(draft[columnKey])}
                    renderValue={(value) => {
                      const option = options?.find((item) => String(item.value) === String(value));

                      return (
                        <Box
                          component="span"
                          sx={{ color: option ? 'text.primary' : 'text.secondary', fontSize: 14 }}
                        >
                          {option?.label ?? column.name}
                        </Box>
                      );
                    }}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        [columnKey]: parseOptionValue(String(event.target.value), options ?? []),
                      }));
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: {
                          sx: {
                            '& .MuiMenuItem-root': { fontSize: 13, minHeight: 32 },
                          },
                        },
                      },
                    }}
                  >
                    {(options ?? []).map((option) => (
                      <MenuItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            if (column.type === 'date' || column.type === 'datetime' || column.type === 'number') {
              const value = getRangeValue(draft[columnKey]);
              const inputType =
                column.type === 'datetime'
                  ? 'datetime-local'
                  : column.type === 'date'
                    ? 'date'
                    : 'number';

              return (
                <Box
                  key={columnKey}
                  sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}
                >
                  <TextField
                    size="small"
                    type={inputType}
                    label={`${column.name} ${t('data_table.from')}`}
                    value={value.from ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [columnKey]: { ...value, from: event.target.value },
                      }))
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      '& .MuiInputBase-input': { fontSize: 14 },
                      '& .MuiInputLabel-root': { fontSize: 13 },
                    }}
                  />
                  <TextField
                    size="small"
                    type={inputType}
                    label={`${column.name} ${t('data_table.to')}`}
                    value={value.to ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [columnKey]: { ...value, to: event.target.value },
                      }))
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      '& .MuiInputBase-input': { fontSize: 14 },
                      '& .MuiInputLabel-root': { fontSize: 13 },
                    }}
                  />
                </Box>
              );
            }

            return (
              <TextField
                key={columnKey}
                size="small"
                label={column.name}
                value={toSelectValue(draft[columnKey])}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [columnKey]: event.target.value,
                  }))
                }
                sx={{
                  '& .MuiInputBase-input': { fontSize: 14 },
                  '& .MuiInputLabel-root': { fontSize: 13 },
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={handleReset}
            sx={{ fontSize: 12, fontWeight: 500, minHeight: 32, px: 1.25 }}
          >
            {t('data_table.reset')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApply}
            sx={{ fontSize: 12, fontWeight: 500, minHeight: 32, px: 1.25 }}
          >
            {t('data_table.apply_filters')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};
