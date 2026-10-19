import type { AppOption } from '@contenster/shared';
import type { I18nService } from 'nestjs-i18n';

import type { I18nPath, I18nTranslations } from '@/i18n/translations';

export const createEnumOptions = <TValue extends string, TKey extends I18nPath>(
  dictionary: Record<TValue, TKey>,
  i18n: I18nService<I18nTranslations>,
): AppOption<TValue>[] =>
  (Object.entries(dictionary) as [TValue, TKey][]).map(([value, translationKey]) => ({
    disabled: null,
    label: i18n.t(translationKey),
    metadata: null,
    value,
  }));
