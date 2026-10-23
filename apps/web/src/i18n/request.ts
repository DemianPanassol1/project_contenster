import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { getRequestConfig } from 'next-intl/server';

import { messagesByLocale } from './messages';
import { isLocale } from './routing';

export default getRequestConfig(async ({ locale: requestedLocale }) => {
  const locale = requestedLocale ?? (await rootParams.locale());

  if (!isLocale(locale)) {
    notFound();
  }

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
