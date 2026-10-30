'use client';

import { TablePagination } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';

interface DataTablePaginationProps {
  page: number;
  perPage: number;
  totalItems: number;
  perPageOptions: number[];
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export const DataTablePagination = ({
  page,
  perPage,
  totalItems,
  perPageOptions,
  onPageChange,
  onPerPageChange,
}: DataTablePaginationProps) => {
  const t = useTranslations();

  return (
    <TablePagination
      component="div"
      count={totalItems}
      page={Math.max(0, page - 1)}
      rowsPerPage={perPage}
      rowsPerPageOptions={perPageOptions}
      labelRowsPerPage={t('data_table.rows_per_page')}
      onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
      onRowsPerPageChange={(event) => onPerPageChange(Number(event.target.value))}
      slotProps={{
        menuItem: {
          sx: { fontSize: portalFontSize(13), minHeight: 32 },
        },
        select: {
          sx: { fontSize: portalFontSize(14) },
        },
      }}
      sx={{
        overflow: 'visible',
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        '& .MuiTablePagination-toolbar': {
          minHeight: 44,
          px: 1.5,
          py: { xs: 0.5, sm: 0 },
          gap: { xs: 0.5, sm: 0 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          justifyContent: 'flex-end',
        },
        '& .MuiTablePagination-spacer': {
          display: { xs: 'none', sm: 'block' },
        },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          m: 0,
          fontSize: portalFontSize(12),
        },
        '& .MuiTablePagination-actions': {
          ml: { xs: 0.5, sm: 2.5 },
        },
      }}
    />
  );
};
