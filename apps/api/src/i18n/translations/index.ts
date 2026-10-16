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

type TranslationLeafPath<Value, Prefix extends string = ''> = Value extends string
  ? Prefix
  : Value extends Record<string, unknown>
    ? {
        [Key in keyof Value & string]: TranslationLeafPath<
          Value[Key],
          `${Prefix}${Prefix extends '' ? '' : '.'}${Key}`
        >;
      }[keyof Value & string]
    : never;

type SameTranslationKeys<Reference, Candidate> =
  Exclude<TranslationLeafPath<Reference>, TranslationLeafPath<Candidate>> extends never
    ? Exclude<TranslationLeafPath<Candidate>, TranslationLeafPath<Reference>> extends never
      ? true
      : never
    : never;

type InvalidTranslationValue<Value> = Value extends string
  ? never
  : Value extends Record<string, unknown>
    ? { [Key in keyof Value]: InvalidTranslationValue<Value[Key]> }[keyof Value]
    : Value;

type TranslationValuesAreStrings<Value> =
  InvalidTranslationValue<Value> extends never ? true : never;

export type I18nTranslations = {
  errors: typeof ptErrors;
  fields: typeof ptFields;
  validation: typeof ptValidation;
};

export type I18nPath = Extract<Path<I18nTranslations>, TranslationLeafPath<I18nTranslations>>;

export type I18nTranslationKeyParity = [
  SameTranslationKeys<typeof ptErrors, typeof enErrors>,
  SameTranslationKeys<typeof ptErrors, typeof esErrors>,
  SameTranslationKeys<typeof ptFields, typeof enFields>,
  SameTranslationKeys<typeof ptFields, typeof esFields>,
  SameTranslationKeys<typeof ptValidation, typeof enValidation>,
  SameTranslationKeys<typeof ptValidation, typeof esValidation>,
  TranslationValuesAreStrings<typeof ptErrors>,
  TranslationValuesAreStrings<typeof enErrors>,
  TranslationValuesAreStrings<typeof esErrors>,
  TranslationValuesAreStrings<typeof ptFields>,
  TranslationValuesAreStrings<typeof enFields>,
  TranslationValuesAreStrings<typeof esFields>,
  TranslationValuesAreStrings<typeof ptValidation>,
  TranslationValuesAreStrings<typeof enValidation>,
  TranslationValuesAreStrings<typeof esValidation>,
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
  true,
  true,
  true,
];
