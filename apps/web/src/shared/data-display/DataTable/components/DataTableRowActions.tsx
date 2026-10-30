'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useModalContext } from '@/core/providers';
import { portalFontSize } from '@/core/theme';
import { Icon } from '@/shared/ui/Icon';

import type { DataTableAction } from '../types/DataTable.types';

interface DataTableRowActionsProps<T extends object> {
  row: T;
  rowId: string | number;
  actions: DataTableAction<T>[];
}

const resolveBoolean = <T extends object>(
  value: boolean | ((row: T) => boolean) | undefined,
  row: T,
): boolean => {
  if (typeof value === 'function') {
    return value(row);
  }

  return Boolean(value);
};

export const DataTableRowActions = <T extends object>({
  row,
  rowId,
  actions,
}: DataTableRowActionsProps<T>) => {
  const t = useTranslations();
  const { openModal, closeModal } = useModalContext();
  const visibleActions = actions.filter((action) => !resolveBoolean(action.hidden, row));

  if (!visibleActions.length) {
    return null;
  }

  const executeAction = async (action: DataTableAction<T>) => {
    const confirmMessage =
      typeof action.confirm === 'object'
        ? (action.confirm.message ?? action.confirm.title ?? action.label)
        : action.label;

    if (action.confirm) {
      openModal({
        title:
          typeof action.confirm === 'object'
            ? (action.confirm.title ?? t('data_table.confirm_action_title'))
            : t('data_table.confirm_action_title'),
        maxWidth: 'xs',
        content: (
          <Typography sx={{ fontSize: portalFontSize(13), color: 'text.secondary' }}>
            {confirmMessage}
          </Typography>
        ),
        actions: [
          {
            label:
              typeof action.confirm === 'object'
                ? (action.confirm.cancelLabel ?? t('form.cancel'))
                : t('form.cancel'),
            variant: 'text',
            closeOnClick: true,
          },
          {
            label:
              typeof action.confirm === 'object'
                ? (action.confirm.confirmLabel ?? t('data_table.confirm'))
                : t('data_table.confirm'),
            variant: 'contained',
            color: action.color === 'secondary' ? 'primary' : (action.color ?? 'primary'),
            closeOnClick: false,
            onClick: async () => {
              await action.onClick(row, rowId);
              closeModal();
            },
          },
        ],
      });

      return;
    }

    await action.onClick(row, rowId);
  };

  return (
    <Box
      sx={{
        gap: 0.25,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {visibleActions.map((action) => {
        const disabled = resolveBoolean(action.disabled, row);

        return (
          <Tooltip key={action.label} title={action.label} arrow>
            <Box component="span">
              <IconButton
                size="small"
                aria-label={action.label}
                disabled={disabled}
                color={action.color ?? 'primary'}
                onClick={() => {
                  void executeAction(action);
                }}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                }}
              >
                <Icon name={action.icon ?? 'circle-help'} size={17} />
              </IconButton>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};
