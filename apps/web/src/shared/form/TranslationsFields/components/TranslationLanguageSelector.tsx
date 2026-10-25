import { Box, ButtonBase, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';

import { toDisplayText } from '@/utils';

import type { TranslationLanguageSelectorProps } from '../types/translations-fields.types';
import { getLanguageRegionCode, MAX_VISIBLE_LANGUAGES } from '../utils/translations-fields.util';

export const TranslationLanguageSelector = ({
  label,
  ariaLabel,
  languages,
  activeLanguageIndex,
  filledLanguageIndexes,
  visibleStart,
  onChange,
}: TranslationLanguageSelectorProps) => {
  const t = useTranslations('forms.translations');
  const visibleLanguages = languages.slice(visibleStart, visibleStart + MAX_VISIBLE_LANGUAGES);

  return (
    <Box
      role="tablist"
      aria-label={t('selectorAria', { label: ariaLabel ?? toDisplayText(label) })}
      sx={{
        p: 0.25,
        gap: 0.25,
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        maxWidth: '100%',
      }}
    >
      {visibleLanguages.map((language, visibleIndex) => {
        const index = visibleStart + visibleIndex;
        const selected = activeLanguageIndex === index;
        const filled = filledLanguageIndexes.has(index);

        return (
          <Tooltip
            key={`${language.id}-${language.locale}`}
            title={`${language.name} · ${language.locale}`}
          >
            <ButtonBase
              component="button"
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={language.name || language.locale}
              onClick={() => onChange(index)}
              sx={{
                gap: 0.75,
                px: 0.9,
                height: 26,
                minWidth: 42,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderRadius: 0.75,
                borderColor: selected ? 'divider' : 'transparent',
                color: selected ? 'primary.dark' : 'text.secondary',
                bgcolor: selected ? 'action.selected' : 'transparent',
                boxShadow: selected ? '0 1px 3px rgba(15, 23, 42, 0.12)' : 'none',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
                textTransform: 'uppercase',
                transition:
                  'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, color 120ms ease',
                '&:hover': {
                  color: selected ? 'primary.dark' : 'text.primary',
                  bgcolor: selected ? 'action.selected' : 'action.hover',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.dark',
                  outlineOffset: 1,
                },
              }}
            >
              <Box component="span">{getLanguageRegionCode(language)}</Box>
              <Box
                aria-hidden="true"
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: filled ? 'success.light' : 'action.disabledBackground',
                  border: '1px solid',
                  borderColor: filled ? 'success.main' : 'divider',
                }}
              />
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );
};
