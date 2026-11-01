'use client';

import type { SystemAdminClientListItem } from '@contenster/shared';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';

import { SystemAdminClientCard } from './SystemAdminClientCard';

interface SystemAdminClientsListProps {
  clients: SystemAdminClientListItem[];
  onDelete: (client: SystemAdminClientListItem) => void;
  onToggleActive: (client: SystemAdminClientListItem) => void;
}

export function SystemAdminClientsList({
  clients,
  onDelete,
  onToggleActive,
}: SystemAdminClientsListProps) {
  const t = useTranslations('protected.system_admin.clients');

  if (clients.length === 0) {
    return (
      <Typography
        color="text.secondary"
        sx={{ fontSize: portalFontSize(13), py: 6, textAlign: 'center' }}
      >
        {t('empty')}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {clients.map((client) => (
        <SystemAdminClientCard
          client={client}
          key={client.id}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </Box>
  );
}
