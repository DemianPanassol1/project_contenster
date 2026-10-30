'use client';

import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { PortalLoginLayout } from '@contenster/shared';
import { usePortal } from '@/core/providers';

import { AuthIdentityHeader } from './AuthIdentityHeader';
import { AuthSupportFooter } from './AuthSupportFooter';

interface AuthCardProps {
  children: ReactNode;
  fallbackTitle?: string;
  subtitle?: string | null;
  title?: string | null;
}

export function AuthCard({ children, fallbackTitle, subtitle, title }: AuthCardProps) {
  const { identity, login } = usePortal();
  const isSplit = login.layout === PortalLoginLayout.split;
  const hasSupport = Boolean(identity.supportText);
  const resolvedTitle = title ?? login.title ?? fallbackTitle;
  const resolvedSubtitle = subtitle ?? (title === undefined ? login.description : null);

  return (
    <Paper
      elevation={0}
      sx={{
        backdropFilter: { md: isSplit ? 'none' : 'blur(14px)', xs: 'blur(14px)' },
        backgroundColor: (theme) => ({
          md: isSplit ? 'transparent' : alpha(theme.palette.background.paper, 0.94),
          xs: alpha(theme.palette.background.paper, 0.94),
        }),
        border: { md: isSplit ? 'none' : '1px solid', xs: '1px solid' },
        borderColor: (theme) => alpha(theme.palette.divider, 0.8),
        borderRadius: { md: isSplit ? 0 : 3, xs: 3 },
        boxShadow: {
          md: isSplit
            ? 'none'
            : '0 24px 70px -32px rgba(5, 8, 22, 0.75), 0 12px 24px -20px rgba(5, 8, 22, 0.45)',
          xs: '0 24px 70px -32px rgba(5, 8, 22, 0.75), 0 12px 24px -20px rgba(5, 8, 22, 0.45)',
        },
        p: { md: isSplit ? 0 : 4, sm: 4, xs: 2 },
        width: '100%',
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
          borderColor: (theme) => alpha(theme.palette.text.secondary, 0.42),
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.dark',
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'text.secondary',
        },
      }}
    >
      <AuthIdentityHeader />

      {resolvedTitle && (
        <Box sx={{ mb: 3 }}>
          <Typography component="h1" sx={{ fontWeight: 500, lineHeight: 1.2 }} variant="body1">
            {resolvedTitle}
          </Typography>
          {resolvedSubtitle && (
            <Typography color="text.secondary" sx={{ lineHeight: 1.55, mt: 1 }} variant="body2">
              {resolvedSubtitle}
            </Typography>
          )}
        </Box>
      )}

      {children}

      {hasSupport && (
        <Box
          sx={{
            borderTop: (theme) =>
              `1px solid ${theme.palette.mode === 'dark' ? '#334155' : '#E5E7EB'}`,
            bottom: { md: isSplit ? '1rem' : 'auto' },
            left: { md: isSplit ? '1rem' : 'auto' },
            mt: { md: isSplit ? 0 : 3.5, xs: 3.5 },
            position: { md: isSplit ? 'absolute' : 'static', xs: 'static' },
            pt: 2.5,
            right: { md: isSplit ? '1rem' : 'auto' },
            textAlign: 'center',
          }}
        >
          <AuthSupportFooter />
        </Box>
      )}
    </Paper>
  );
}
