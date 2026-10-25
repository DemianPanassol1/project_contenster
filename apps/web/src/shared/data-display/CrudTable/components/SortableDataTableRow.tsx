'use client';

import { useSortable } from '@dnd-kit/sortable';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';

import type { DataTableRowProps } from '@/shared/data-display/DataTable';
import { DataTableRow } from '@/shared/data-display/DataTable/components/DataTableRow';
import { Icon } from '@/shared/ui/Icon';

export const SortableDataTableRow = <TRow extends object>(props: DataTableRowProps<TRow>) => {
  const t = useTranslations();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.rowId,
  });
  const transformStyle = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
    : undefined;

  return (
    <DataTableRow
      {...props}
      tableRowProps={{
        ref: setNodeRef,
        sx: {
          opacity: isDragging ? 0.72 : 1,
          position: 'relative',
          transform: transformStyle,
          transition,
          zIndex: isDragging ? 1 : undefined,
          bgcolor: isDragging ? 'action.hover' : undefined,
        },
      }}
      leadingCell={
        <Tooltip title={t('dataTable.drag')}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              size="small"
              aria-label={t('dataTable.drag')}
              {...attributes}
              {...listeners}
              sx={{
                width: 28,
                height: 28,
                cursor: isDragging ? 'grabbing' : 'grab',
                borderRadius: 1,
                color: 'text.secondary',
              }}
            >
              <Icon name="grip-vertical" size={16} />
            </IconButton>
          </Box>
        </Tooltip>
      }
    />
  );
};
