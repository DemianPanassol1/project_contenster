'use client';

import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/pt-br';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enUS, esES, ptBR } from '@mui/x-date-pickers/locales';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { ReactNode } from 'react';

import type { Locale } from '@/i18n/routing';

interface DatePickersProviderProps {
  children: ReactNode;
  locale: Locale;
}

const localeConfig = {
  en: {
    adapterLocale: 'en',
    localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
  },
  es: {
    adapterLocale: 'es',
    localeText: esES.components.MuiLocalizationProvider.defaultProps.localeText,
  },
  pt: {
    adapterLocale: 'pt-br',
    localeText: ptBR.components.MuiLocalizationProvider.defaultProps.localeText,
  },
} satisfies Record<
  Locale,
  {
    adapterLocale: string;
    localeText: typeof enUS.components.MuiLocalizationProvider.defaultProps.localeText;
  }
>;

export function DatePickersProvider({ children, locale }: DatePickersProviderProps) {
  const config = localeConfig[locale];

  return (
    <LocalizationProvider
      adapterLocale={config.adapterLocale}
      dateAdapter={AdapterDayjs}
      localeText={config.localeText}
    >
      {children}
    </LocalizationProvider>
  );
}
