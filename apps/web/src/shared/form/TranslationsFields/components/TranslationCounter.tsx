import { Paper } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Icon } from '@/shared/ui/Icon';

import type { TranslationCounterProps } from '../types/translations-fields.types';

export const TranslationCounter = ({ filledCount, totalCount }: TranslationCounterProps) => {
  const t = useTranslations('forms.translations');
  const filled = String(filledCount);
  const total = String(totalCount);

  return (
    <Paper
      aria-label={t('filledLanguagesAria', { filled, total })}
      sx={{
        gap: 0.75,
        px: 1,
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        color: 'text.secondary',
        backgroundColor: 'custom.card',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <Icon name="globe" size={14} strokeWidth={1.8} />
      {t('filledLanguagesShort', { filled, total })}
    </Paper>
  );
};
