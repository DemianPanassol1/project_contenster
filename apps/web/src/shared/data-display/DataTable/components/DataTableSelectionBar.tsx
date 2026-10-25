'use client';

import { Box, Button, Chip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Icon } from '@/shared/ui/Icon';

interface DataTableSelectionBarProps {
  selectedCount: number;
  selectedRowsCount: number;
  canDelete: boolean;
  canExport: boolean;
  onClearSelection: () => void;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  deleteLabel?: string;
}

export const DataTableSelectionBar = ({
  selectedCount,
  selectedRowsCount,
  canDelete,
  canExport,
  onClearSelection,
  onExportSelected,
  onDeleteSelected,
  deleteLabel,
}: DataTableSelectionBarProps) => {
  const t = useTranslations();

  if (!selectedCount) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        gap: 1,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'action.hover',
      }}
    >
      <Chip
        size="small"
        color="primary"
        label={selectedCount}
        sx={{ height: 24, borderRadius: '50%', minWidth: 24 }}
      />
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
        {t('dataTable.selectedCount', { count: String(selectedCount) })}
      </Typography>
      <Button
        size="small"
        variant="text"
        onClick={onClearSelection}
        sx={{ textTransform: 'none', fontSize: 12.5 }}
      >
        {t('dataTable.clearSelection')}
      </Button>
      <Box sx={{ flex: 1 }} />
      {canExport && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Icon name="download" size={15} />}
          disabled={!selectedRowsCount}
          onClick={onExportSelected}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12.5 }}
        >
          {t('dataTable.exportSelected')}
        </Button>
      )}
      {canDelete && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Icon name="trash" size={15} />}
          onClick={onDeleteSelected}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12.5 }}
        >
          {deleteLabel ?? t('dataTable.deleteSelected')}
        </Button>
      )}
    </Box>
  );
};
