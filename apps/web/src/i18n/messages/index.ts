import type { Locale } from '../routing';

import type enAuth from './auth/en.json';
import type esAuth from './auth/es.json';
import type ptAuth from './auth/pt.json';
import type enProtected from './protected/en.json';
import type esProtected from './protected/es.json';
import type ptProtected from './protected/pt.json';
import type enPublic from './public/en.json';
import type esPublic from './public/es.json';
import type ptPublic from './public/pt.json';
import enMessages from './en';
import esMessages from './es';
import ptMessages from './pt';

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

export type WebMessages = typeof ptMessages;

export type WebTranslationKeyParity = [
  SameTranslationKeys<typeof ptPublic, typeof enPublic>,
  SameTranslationKeys<typeof ptPublic, typeof esPublic>,
  SameTranslationKeys<typeof ptAuth, typeof enAuth>,
  SameTranslationKeys<typeof ptAuth, typeof esAuth>,
  SameTranslationKeys<typeof ptProtected, typeof enProtected>,
  SameTranslationKeys<typeof ptProtected, typeof esProtected>,
  TranslationValuesAreStrings<typeof ptPublic>,
  TranslationValuesAreStrings<typeof enPublic>,
  TranslationValuesAreStrings<typeof esPublic>,
  TranslationValuesAreStrings<typeof ptAuth>,
  TranslationValuesAreStrings<typeof enAuth>,
  TranslationValuesAreStrings<typeof esAuth>,
  TranslationValuesAreStrings<typeof ptProtected>,
  TranslationValuesAreStrings<typeof enProtected>,
  TranslationValuesAreStrings<typeof esProtected>,
];

export const webTranslationKeyParity: WebTranslationKeyParity = [
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

export const messagesByLocale = {
  pt: ptMessages,
  en: enMessages,
  es: esMessages,
} satisfies Record<Locale, WebMessages>;
