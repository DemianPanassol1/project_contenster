'use client';

import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useRouter } from '@/i18n/navigation';
import { Button, Icon, type IconName, Page } from '@/shared';

interface AdminAccessStateViewProps {
  actionLabel: string;
  contentDescription: string;
  contentTitle: string;
  description: string;
  icon: IconName;
  module: string;
  severity: 'info' | 'warning';
  title: string;
}

export function AdminAccessStateView({
  actionLabel,
  contentDescription,
  contentTitle,
  description,
  icon,
  module,
  severity,
  title,
}: AdminAccessStateViewProps) {
  const router = useRouter();

  return (
    <Page description={description} functionality={title} module={module}>
      <Paper
        variant="outlined"
        sx={{
          alignItems: 'start',
          backgroundColor: 'background.paper',
          borderColor: 'divider',
          borderRadius: 2,
          color: 'text.primary',
          display: 'grid',
          gap: 2,
          maxWidth: 560,
          p: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: (theme) => alpha(theme.palette[severity].main, 0.12),
            borderRadius: 1.5,
            color: `${severity}.main`,
            display: 'grid',
            height: 44,
            placeItems: 'center',
            width: 44,
          }}
        >
          <Icon aria-hidden name={icon} size={22} />
        </Box>

        <Box>
          <Typography
            component="h2"
            sx={{ fontSize: '18px', fontWeight: 600, letterSpacing: 0, mb: 1 }}
            variant="h2"
          >
            {contentTitle}
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '13.5px',
              lineHeight: 1.55,
              maxWidth: '34rem',
            }}
          >
            {contentDescription}
          </Typography>
        </Box>

        <Box>
          <Button
            icon="home"
            iconPosition="start"
            label={actionLabel}
            onClick={() => router.push('/admin')}
          />
        </Box>
      </Paper>
    </Page>
  );
}
