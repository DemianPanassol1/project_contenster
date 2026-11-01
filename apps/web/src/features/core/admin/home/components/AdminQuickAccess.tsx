'use client';

import { Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';
import { crudListPath } from '@/features/shared/navigation';
import { Link } from '@/i18n/navigation';
import { Icon, Page } from '@/shared';

import type { AdminQuickAccessModule } from '../types/admin-home.types';

interface AdminQuickAccessProps {
  modules: AdminQuickAccessModule[];
}

export function AdminQuickAccess({ modules }: AdminQuickAccessProps) {
  const t = useTranslations('protected.home');

  return (
    <Page module={t('module')} functionality={t('title')} description={t('description')}>
      {modules.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            backgroundColor: 'background.paper',
            borderColor: 'divider',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: portalFontSize(15), fontWeight: 600, mb: 0.75 }} variant="h6">
            {t('empty.title')}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t('empty.description')}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 3.5 }}>
          {modules.map((module) => (
            <Box component="section" key={module.id} aria-labelledby={`module-${module.id}`}>
              <Typography
                component="h2"
                id={`module-${module.id}`}
                sx={{
                  color: 'text.secondary',
                  fontSize: portalFontSize(13),
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  mb: 1.25,
                  textTransform: 'uppercase',
                }}
                variant="body2"
              >
                {module.title}
              </Typography>

              <Box
                sx={{
                  alignItems: 'stretch',
                  display: 'grid',
                  gap: 2,
                  gridAutoRows: '1fr',
                  gridTemplateColumns: {
                    md: 'repeat(3, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))',
                    xs: 'minmax(0, 1fr)',
                  },
                }}
              >
                {module.items.map((item) => (
                  <Link
                    href={crudListPath(item.slug) as never}
                    key={item.id}
                    prefetch={false}
                    style={{
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'block',
                      height: '100%',
                      minWidth: 0,
                      textDecoration: 'none',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        alignItems: 'center',
                        backgroundColor: 'background.paper',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 1.5,
                        height: '100%',
                        minWidth: 0,
                        p: 1.5,
                        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: 'action.hover',
                          borderRadius: 2,
                          color: 'primary.main',
                          display: 'grid',
                          flex: '0 0 auto',
                          height: 34,
                          placeItems: 'center',
                          width: 34,
                        }}
                      >
                        <Icon aria-hidden name={item.icon} size={19} />
                      </Box>

                      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                        <Typography
                          sx={{ fontSize: portalFontSize(14), fontWeight: 600 }}
                          variant="h6"
                        >
                          {item.title}
                        </Typography>
                        {item.description && (
                          <Typography
                            sx={{
                              color: 'text.secondary',
                              fontSize: portalFontSize(12.5),
                              lineHeight: 1.4,
                              mt: 0.375,
                            }}
                            variant="body2"
                          >
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Page>
  );
}
