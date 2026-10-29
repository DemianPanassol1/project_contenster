'use client';

import { Box, Menu, MenuItem, Typography, useTheme } from '@mui/material';
import { Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { useGlobalContext } from '@/core/providers';
import { usePathname, useRouter } from '@/i18n/navigation';
import { isLocale, type Locale, locales } from '@/i18n/routing';
import { IconButton } from '@/shared';
import { getLanguageLabelKey } from '@/utils';

export function AdminHeaderActions() {
  const theme = useTheme();
  const t = useTranslations();
  const { state, toggleTheme } = useGlobalContext();
  const params = useParams();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [languageAnchor, setLanguageAnchor] = useState<HTMLElement | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const supportedLanguages = locales.map((value) => ({ locale: value, name: value }));
  const languageMenuOpen = Boolean(languageAnchor);
  const notificationMenuOpen = Boolean(notificationAnchor);

  const changeLanguage = (nextLocale: Locale) => {
    router.replace({ pathname, params } as never, { locale: nextLocale });
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.25 }}>
      <IconButton
        icon={state.theme === 'light' ? 'sun' : 'moon'}
        onClick={() => toggleTheme()}
        toolTip={t(
          state.theme === 'light' ? 'global.toggle_theme_dark' : 'global.toggle_theme_light',
        )}
      />

      {supportedLanguages.length > 1 && (
        <IconButton
          color={languageMenuOpen ? theme.palette.primary.main : undefined}
          icon="globe"
          onClick={(event) => setLanguageAnchor(event.currentTarget)}
          toolTip={t('global.select_language')}
        />
      )}

      <IconButton
        color={notificationMenuOpen ? theme.palette.primary.main : undefined}
        icon="bell"
        onClick={(event) => setNotificationAnchor(event.currentTarget)}
        toolTip={t('global.notifications')}
      />

      <Menu
        anchorEl={languageAnchor}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClick={() => setTimeout(() => setLanguageAnchor(null), 150)}
        onClose={() => setLanguageAnchor(null)}
        open={languageMenuOpen}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              border: (currentTheme) => `1px solid ${currentTheme.palette.divider}`,
              borderRadius: '12px',
              boxShadow: (currentTheme) => currentTheme.shadows[4],
              maxWidth: 'calc(100vw - 32px)',
              px: 0.75,
              width: 210,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            mb: 0.75,
            px: 1,
            py: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {t('global.language')}
        </Typography>

        {supportedLanguages.map((language) => {
          const selected = locale === language.locale;
          const labelKey = getLanguageLabelKey(language);

          return (
            <MenuItem
              key={language.locale}
              onClick={() => isLocale(language.locale) && changeLanguage(language.locale)}
              selected={selected}
              sx={{
                borderRadius: '8px',
                fontSize: '13px',
                gap: 0.75,
                mb: 0.15,
                minHeight: 32,
                px: 1,
              }}
            >
              <Typography component="span" sx={{ fontSize: '13px', fontWeight: 600, minWidth: 48 }}>
                {language.locale.toUpperCase()}
                <Box
                  component="em"
                  sx={{ color: 'text.secondary', fontSize: '9px', fontWeight: 400 }}
                >
                  ({language.locale})
                </Box>
              </Typography>

              <Typography sx={{ flex: 1, fontSize: '13px' }} variant="body2">
                {labelKey ? t(labelKey as never) : language.name}
              </Typography>

              {selected && <Check color={theme.palette.primary.main} size={16} />}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClick={() => setTimeout(() => setNotificationAnchor(null), 150)}
        onClose={() => setNotificationAnchor(null)}
        open={notificationMenuOpen}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              border: (currentTheme) => `1px solid ${currentTheme.palette.divider}`,
              borderRadius: '12px',
              boxShadow: (currentTheme) => currentTheme.shadows[4],
              overflow: 'hidden',
              width: 375,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box
          sx={{
            alignItems: 'center',
            borderBottom: (currentTheme) => `1px solid ${currentTheme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            pb: 1.5,
            pt: 0.5,
            px: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
              {t('global.notifications')}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '11px', mt: 0.25 }}>
              0 {t('global.not_read')}
            </Typography>
          </Box>
          <Typography
            color="primary.main"
            sx={{ cursor: 'default', fontSize: '11px', fontWeight: 500 }}
          >
            {t('global.mark_all_as_read')}
          </Typography>
        </Box>

        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: 125,
            justifyContent: 'center',
            px: 3,
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: '12px', textAlign: 'center' }}>
            {t('global.notifications_empty')}
          </Typography>
        </Box>

        <Box
          sx={{
            borderTop: (currentTheme) => `1px solid ${currentTheme.palette.divider}`,
            pb: 0.75,
            pt: 1.75,
            px: 2,
          }}
        >
          <Typography
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'text-decoration-color .15s ease',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {t('global.see_all_notifications')}
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
}
