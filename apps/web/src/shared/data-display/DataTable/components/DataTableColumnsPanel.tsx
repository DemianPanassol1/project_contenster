'use client';

import { Box, Button, Chip, Popover, Switch, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Icon } from '@/shared/ui/Icon';

import type { DataTableColumn } from '../types/DataTable.types';
import { getColumnKey } from '../utils/data-table.util';

interface DataTableColumnsPanelProps<T extends object> {
  columns: DataTableColumn<T>[];
  hiddenColumnKeys: string[];
  initialHiddenColumnKeys: string[];
  hasActions?: boolean;
  selectable?: boolean;
  onHiddenColumnKeysChange: (columnKeys: string[]) => void;
}

export const DataTableColumnsPanel = <T extends object>({
  columns,
  hiddenColumnKeys,
  initialHiddenColumnKeys,
  hasActions = false,
  selectable = false,
  onHiddenColumnKeysChange,
}: DataTableColumnsPanelProps<T>) => {
  const t = useTranslations();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const visibleCount = columns.filter(
    (column) => !hiddenColumnKeys.includes(getColumnKey(column)),
  ).length;
  const totalCount = columns.length;

  const toggleColumn = (columnKey: string, visible: boolean) => {
    if (visible) {
      onHiddenColumnKeysChange(
        hiddenColumnKeys.filter((currentColumnKey) => currentColumnKey !== columnKey),
      );
      return;
    }

    onHiddenColumnKeysChange([...hiddenColumnKeys, columnKey]);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Icon name="list" size={16} />}
        endIcon={
          <Chip
            size="small"
            label={`${visibleCount}/${totalCount}`}
            sx={{ height: 20, borderRadius: 1, fontSize: '12px !important' }}
          />
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
        {t('data_table.columns')}
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
              width: 324,
              overflow: 'hidden',
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => theme.shadows[4],
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
            {t('data_table.columns')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {t('data_table.visible_columns', {
              visible: String(visibleCount),
              total: String(totalCount),
            })}
          </Typography>
        </Box>

        <Box sx={{ px: 2, py: 1, display: 'grid', gap: 0.5 }}>
          {selectable && <ColumnSwitchRow label={t('data_table.selection')} checked locked />}

          {columns.map((column) => {
            const columnKey = getColumnKey(column);
            const checked = !hiddenColumnKeys.includes(columnKey);

            return (
              <ColumnSwitchRow
                key={columnKey}
                label={column.name}
                checked={checked}
                locked={column.locked}
                onChange={(visible) => toggleColumn(columnKey, visible)}
              />
            );
          })}

          {hasActions && <ColumnSwitchRow label={t('data_table.actions')} checked locked />}
        </Box>

        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            size="small"
            variant="text"
            startIcon={<Icon name="check" size={14} />}
            onClick={() => onHiddenColumnKeysChange([])}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            {t('data_table.show_all')}
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<Icon name="refresh-cw" size={14} />}
            onClick={() => onHiddenColumnKeysChange(initialHiddenColumnKeys)}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            {t('data_table.reset')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

interface ColumnSwitchRowProps {
  label: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (checked: boolean) => void;
}

const ColumnSwitchRow = ({ label, checked, locked, onChange }: ColumnSwitchRowProps) => {
  return (
    <Box
      sx={{
        minHeight: 34,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography
        sx={{
          flex: 1,
          fontSize: 12.5,
          color: locked ? 'text.secondary' : 'text.primary',
        }}
      >
        {label}
      </Typography>
      {locked && <Icon name="lock" size={13} style={{ color: 'currentColor' }} />}
      <Switch
        size="small"
        checked={checked}
        disabled={locked}
        onChange={(event) => onChange?.(event.target.checked)}
      />
    </Box>
  );
};
