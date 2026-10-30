'use client';

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { portalFontSize } from '@/core/theme';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Icon } from '@/shared';

import { systemAdminNavigation } from './system-admin-navigation';

interface SystemAdminDrawerNavigationProps {
  collapsed: boolean;
  height: string;
}

export function SystemAdminDrawerNavigation({
  collapsed,
  height,
}: SystemAdminDrawerNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('protected.system_admin.navigation');
  const {
    state: { isLoading },
  } = useGlobalContext();

  return (
    <Box sx={{ height, width: '100%' }}>
      <List
        disablePadding
        sx={{
          height: '100%',
          overflow: 'clip auto',
          px: 1,
          py: 1.5,
          width: '100%',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.42)',
            borderRadius: '999px',
          },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.72)',
              fontSize: portalFontSize(10.5),
              fontWeight: 600,
              letterSpacing: '0.08em',
              mb: 0.75,
              px: 1.5,
              textTransform: 'uppercase',
            }}
          >
            {t('navigation_title')}
          </Typography>
        )}

        {systemAdminNavigation.map((item) => {
          const selected = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = t(item.translationKey);

          return (
            <Tooltip key={item.href} placement="right" title={collapsed ? label : ''}>
              <ListItemButton
                aria-current={selected ? 'page' : undefined}
                aria-label={collapsed ? label : undefined}
                disabled={isLoading}
                onClick={() => router.push(item.href)}
                sx={{
                  backgroundColor: selected ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                  borderRadius: '10px',
                  color: 'primary.contrastText',
                  height: 36,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  mb: 0.25,
                  px: collapsed ? 0 : 1.25,
                  transition: 'background-color .2s ease',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    justifyContent: collapsed ? 'center' : undefined,
                    minWidth: collapsed ? 0 : 28,
                  }}
                >
                  <Icon name={item.icon} size={17} strokeWidth={selected ? 2.25 : 1.85} />
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={
                      <Typography
                        noWrap
                        sx={{
                          color: 'inherit',
                          fontSize: portalFontSize(13),
                          fontWeight: selected ? 600 : 500,
                        }}
                      >
                        {label}
                      </Typography>
                    }
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
}
