'use client';

import { Box, Button, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Icon } from '@/shared/ui/Icon';

interface DataTableToolbarProps {
  search: string;
  canSearch: boolean;
  primaryAction?: ReactNode;
  children?: ReactNode;
  manualFilterChips?: ReactNode;
  searchFilterChips?: ReactNode;
  hasSearchFilterChips?: boolean;
  onSearchChange: (value: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export const DataTableToolbar = ({
  search,
  canSearch,
  primaryAction,
  children,
  manualFilterChips,
  searchFilterChips,
  hasSearchFilterChips = false,
  onSearchChange,
  onExport,
  onRefresh,
}: DataTableToolbarProps) => {
  const t = useTranslations();

  return (
    <Box
      sx={{
        p: 1.5,
        gap: 1,
        minWidth: 0,
        display: 'grid',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          minWidth: 0,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        {canSearch && (
          <TextField
            size="small"
            value={search}
            placeholder={t('data_table.search')}
            onChange={(event) => onSearchChange(event.target.value)}
            sx={{
              width: { xs: '100%', sm: 320 },
              maxWidth: '100%',
              flexShrink: 0,
              '& .MuiInputBase-input': {
                fontSize: 13,
              },
            }}
            slotProps={{
              input: {
                startAdornment: <Icon name="search" size={15} style={{ marginRight: 8 }} />,
              },
            }}
          />
        )}

        <Box
          sx={{
            gap: 1,
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' },
            flex: { sm: '1 1 auto' },
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {manualFilterChips}

          {children}

          {onRefresh && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Icon name="refresh-cw" size={16} />}
              onClick={onRefresh}
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
              {t('data_table.reset')}
            </Button>
          )}

          {onExport && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Icon name="download" size={16} />}
              onClick={onExport}
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
              {t('data_table.export')}
            </Button>
          )}

          {primaryAction}
        </Box>
      </Box>

      {hasSearchFilterChips && (
        <Box
          sx={{
            width: '100%',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {searchFilterChips}
        </Box>
      )}
    </Box>
  );
};
