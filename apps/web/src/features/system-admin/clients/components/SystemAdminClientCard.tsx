'use client';

import type { SystemAdminClientListItem } from '@contenster/shared';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import { Building2, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';
import { Button } from '@/shared';
import { FormatUtils } from '@/utils';

interface SystemAdminClientCardProps {
  client: SystemAdminClientListItem;
  onDelete: (client: SystemAdminClientListItem) => void;
  onToggleActive: (client: SystemAdminClientListItem) => void;
}

export function SystemAdminClientCard({
  client,
  onDelete,
  onToggleActive,
}: SystemAdminClientCardProps) {
  const t = useTranslations('protected.system_admin.clients');
  const formattedDocument = FormatUtils.formatDocument(client.document, client.documentType);

  return (
    <Paper variant="outlined" elevation={1} square={false} sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          alignItems: { md: 'center', xs: 'flex-start' },
          display: 'flex',
          flexDirection: { md: 'row', xs: 'column' },
          gap: 2,
          justifyContent: 'space-between',
          p: { md: 3, xs: 2 },
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 2, minWidth: 0 }}>
          <Avatar
            src={client.imageUrl ?? undefined}
            sx={(theme) => ({
              backgroundColor: 'primary.main',
              borderRadius: 999,
              color: 'primary.contrastText',
              height: 48,
              width: 48,
              boxShadow: theme.shadows[4],
            })}
          >
            <Building2 size={20} />
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: portalFontSize(16),
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {client.corporateName}
              </Typography>
              <Box
                sx={{
                  alignItems: 'center',
                  color: 'text.secondary',
                  display: 'inline-flex',
                  fontSize: portalFontSize(11.5),
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: client.isActive ? 'success.main' : 'text.disabled',
                    borderRadius: '50%',
                    height: 7,
                    width: 7,
                  }}
                />
                {client.isActive ? t('active') : t('inactive')}
              </Box>
            </Box>

            <Typography color="text.secondary" sx={{ fontSize: portalFontSize(12), mt: 0.25 }}>
              {client.tradeName}
            </Typography>

            <Box
              sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 1.25, mt: 0.75 }}
            >
              <Typography color="text.secondary" sx={{ fontSize: portalFontSize(11.5) }}>
                {formattedDocument}
              </Typography>
              <Box
                sx={{ alignItems: 'center', color: 'text.secondary', display: 'flex', gap: 0.5 }}
              >
                <UsersRound size={14} />
                <Typography sx={{ fontSize: portalFontSize(11.5) }}>
                  {t('user_count', { count: client.userCount })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
          <Button
            color="warning"
            icon={client.isActive ? 'pause' : 'play'}
            iconPosition="start"
            label={client.isActive ? t('deactivate_client') : t('activate_client')}
            onClick={() => onToggleActive(client)}
            variant="outlined"
          />
          <Button
            color="error"
            icon="trash"
            iconPosition="start"
            label={t('delete_client')}
            onClick={() => onDelete(client)}
            variant="outlined"
          />
        </Box>
      </Box>
    </Paper>
  );
}
