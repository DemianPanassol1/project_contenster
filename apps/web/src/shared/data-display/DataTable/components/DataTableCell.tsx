'use client';

import { Avatar, Chip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';
import { Icon } from '@/shared/ui/Icon';
import { toDisplayText } from '@/utils';

import type { DataTableColumn } from '../types/DataTable.types';
import { formatCellText, formatColumnValue, isIconName } from '../utils/data-table.util';

interface DataTableCellProps<T extends object> {
  row: T;
  column: DataTableColumn<T>;
  value: unknown;
}

export const DataTableCell = <T extends object>({ row, column, value }: DataTableCellProps<T>) => {
  const t = useTranslations();

  if (column.renderCell) {
    return <>{column.renderCell({ row, value })}</>;
  }

  const formattedValue = formatColumnValue(value, column);

  switch (column.type) {
    case 'boolean':
      return (
        <Chip
          size="small"
          label={value ? t('data_table.yes') : t('data_table.no')}
          color={value ? 'success' : 'default'}
          sx={{ height: 24, borderRadius: 1, fontSize: portalFontSize(11.5) }}
        />
      );

    case 'status':
      return (
        <Chip
          size="small"
          label={formattedValue}
          sx={{ height: 24, borderRadius: 1, fontSize: portalFontSize(11.5) }}
        />
      );

    case 'icon':
      return isIconName(value) ? (
        <Icon name={value} size={16} />
      ) : (
        <Typography sx={{ fontSize: portalFontSize(13) }}>{formatCellText(value)}</Typography>
      );

    case 'image':
      return (
        <Avatar
          src={typeof value === 'string' ? value : undefined}
          sx={{ width: 28, height: 28, fontSize: portalFontSize(11) }}
        >
          {!value ? '-' : undefined}
        </Avatar>
      );

    case 'file':
      return <Typography sx={{ fontSize: portalFontSize(13) }}>{formattedValue}</Typography>;

    case 'date':
      return (
        <Typography sx={{ fontSize: portalFontSize(13) }}>
          {value ? new Date(toDisplayText(value)).toLocaleDateString() : ''}
        </Typography>
      );

    case 'datetime':
      return (
        <Typography sx={{ fontSize: portalFontSize(13) }}>
          {value ? new Date(toDisplayText(value)).toLocaleString() : ''}
        </Typography>
      );

    case 'number':
    case 'text':
    case 'custom':
    default:
      return <Typography sx={{ fontSize: portalFontSize(13) }}>{formattedValue}</Typography>;
  }
};
