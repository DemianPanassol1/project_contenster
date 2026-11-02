'use client';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Icon } from '@/shared';

interface AccessModelSortableItemProps {
  id: UniqueIdentifier;
  children: (dragHandle: ReactNode) => ReactNode;
}

export const AccessModelSortableItem = ({ id, children }: AccessModelSortableItemProps) => {
  const t = useTranslations('protected.access_models');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 0,
        opacity: isDragging ? 0.72 : 1,
        position: 'relative',
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
          : undefined,
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
    >
      {children(
        <Tooltip title={t('drag')}>
          <IconButton
            size="small"
            aria-label={t('drag')}
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: 30,
              height: 30,
              flex: '0 0 auto',
              cursor: isDragging ? 'grabbing' : 'grab',
              borderRadius: 1,
              color: 'text.secondary',
            }}
          >
            <Icon name="grip-vertical" size={17} />
          </IconButton>
        </Tooltip>,
      )}
    </Box>
  );
};
