import type { Path } from 'nestjs-i18n';

import type enErrors from './en/errors.json';
import type enFields from './en/fields.json';
import type enValidation from './en/validation.json';
import type esErrors from './es/errors.json';
import type esFields from './es/fields.json';
import type esValidation from './es/validation.json';
import type ptErrors from './pt/errors.json';
import type ptFields from './pt/fields.json';
import type ptValidation from './pt/validation.json';

type ExactKeys<Source, Target extends Source> =
  Exclude<keyof Target, keyof Source> extends never ? true : never;

type SameKeys<Source, Target extends Source> = ExactKeys<Source, Target>;

export type I18nTranslations = {
  errors: typeof ptErrors;
  fields: typeof ptFields;
  validation: typeof ptValidation;
};

export type I18nPath = Path<I18nTranslations>;

export type I18nTranslationKeyParity = [
  SameKeys<typeof ptErrors, typeof enErrors>,
  SameKeys<typeof enErrors, typeof ptErrors>,
  SameKeys<typeof ptErrors, typeof esErrors>,
  SameKeys<typeof esErrors, typeof ptErrors>,
  SameKeys<typeof ptFields, typeof enFields>,
  SameKeys<typeof enFields, typeof ptFields>,
  SameKeys<typeof ptFields, typeof esFields>,
  SameKeys<typeof esFields, typeof ptFields>,
  SameKeys<typeof ptValidation, typeof enValidation>,
  SameKeys<typeof enValidation, typeof ptValidation>,
  SameKeys<typeof ptValidation, typeof esValidation>,
  SameKeys<typeof esValidation, typeof ptValidation>,
];

export const i18nTranslationKeyParity: I18nTranslationKeyParity = [
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
];
