import type { FieldError, FieldErrors, FieldValues, RegisterOptions } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { toDisplayText } from '@/utils';
import { splitValidationRules } from '@/utils/validation-rules.util';

import type {
  PartialTranslationField,
  TranslationLocaleOption,
  TranslationTextProperty,
  ValidationConfig,
} from '../types/translations-fields.types';

export const MAX_VISIBLE_LANGUAGES = 3;
const normalizeLocale = (locale: string): string => locale.trim().toLowerCase();

export const orderTranslationLanguages = (
  languages: TranslationLocaleOption[],
  activeLocale: string,
): TranslationLocaleOption[] => {
  const normalizedActiveLocale = normalizeLocale(activeLocale);

  return languages
    .map((language, originalIndex) => ({ language, originalIndex }))
    .sort((first, second) => {
      const firstIsActive = first.language.locale === normalizedActiveLocale;
      const secondIsActive = second.language.locale === normalizedActiveLocale;

      if (firstIsActive !== secondIsActive) {
        return firstIsActive ? -1 : 1;
      }

      const idDifference = Number(first.language.id) - Number(second.language.id);

      return idDifference || first.originalIndex - second.originalIndex;
    })
    .map(({ language }) => language);
};

export const alignTranslationsWithLanguages = (
  value: unknown,
  languages: TranslationLocaleOption[],
): PartialTranslationField[] => {
  const translations = Array.isArray(value) ? (value as PartialTranslationField[]) : [];
  return languages.map(
    ({ locale }) => translations.find((translation) => translation.locale === locale) ?? { locale },
  );
};

export const areEquivalentTranslations = (
  value: unknown,
  normalizedTranslations: PartialTranslationField[],
  textProperty: TranslationTextProperty = 'text',
): boolean => {
  if (!Array.isArray(value) || value.length !== normalizedTranslations.length) {
    return false;
  }

  return normalizedTranslations.every((normalizedTranslation, index) =>
    isEquivalentTranslation(value[index], normalizedTranslation, textProperty),
  );
};

export const createTranslationRules = <TForm extends FieldValues>(
  rules: RegisterOptions<TForm> | undefined,
  validations: ValidationConfig<TForm> | undefined,
  createValidationRules: (rules: string | string[]) => RegisterOptions<TForm>,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  },
): RegisterOptions<TForm> | undefined => {
  const validationRules = createValidationRuleList(validations, options);
  const generatedRules = validationRules.length ? createValidationRules(validationRules) : {};
  const explicitRules = isRegisterOptions(validations) ? validations : {};
  const nextRules: RegisterOptions<TForm> = {};

  mergeRegisterRules(nextRules, generatedRules);
  mergeRegisterRules(nextRules, explicitRules);
  mergeRegisterRules(nextRules, rules);

  return Object.keys(nextRules).length ? nextRules : undefined;
};

export const isFilledTranslation = (value: unknown): boolean =>
  toDisplayText(value).trim().length > 0;

export const hasRequiredValidation = <TForm extends FieldValues>(
  validations: ValidationConfig<TForm> | undefined,
): boolean => {
  if (!validations) return false;

  if (isRegisterOptions(validations)) {
    return Boolean(validations.required);
  }

  const rules = Array.isArray(validations) ? validations : [validations];

  return hasRule(rules, 'required');
};

export const getLocaleCode = (language: TranslationLocaleOption): string => language.locale;

export const getNextVisibleStart = (
  clickedIndex: number,
  currentStart: number,
  totalLanguages: number,
): number => {
  if (totalLanguages <= MAX_VISIBLE_LANGUAGES) {
    return 0;
  }

  const visibleEnd = currentStart + MAX_VISIBLE_LANGUAGES - 1;

  if (clickedIndex === visibleEnd && visibleEnd < totalLanguages - 1) {
    return currentStart + 1;
  }

  if (clickedIndex === currentStart && currentStart > 0) {
    return currentStart - 1;
  }

  return currentStart;
};

export const getVisibleStartForIndex = (index: number, totalLanguages: number): number => {
  if (totalLanguages <= MAX_VISIBLE_LANGUAGES) {
    return 0;
  }

  return Math.min(Math.max(index - 1, 0), totalLanguages - MAX_VISIBLE_LANGUAGES);
};

export const clampVisibleStart = (visibleStart: number, totalLanguages: number): number => {
  if (totalLanguages <= MAX_VISIBLE_LANGUAGES) {
    return 0;
  }

  return Math.min(visibleStart, totalLanguages - MAX_VISIBLE_LANGUAGES);
};

export const getTranslationTextError = (
  errors: FieldErrors,
  name: string,
  index: number,
  textProperty: TranslationTextProperty = 'text',
): FieldError | undefined => {
  const fieldError = getValueByPath(errors, `${name}.${index}.${textProperty}`);

  return isFieldError(fieldError) ? fieldError : undefined;
};

export const getBaseTextFieldSx = () => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    '& fieldset': {
      borderColor: 'divider',
    },
    '&:hover fieldset': {
      borderColor: 'text.secondary',
    },
    '&.Mui-focused fieldset': {
      borderWidth: 1,
      borderColor: 'primary.dark',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: portalFontSize(13),
  },
  '& .MuiInputBase-input': {
    fontSize: portalFontSize(14),
  },
  '& .MuiFormHelperText-root': {
    mr: 0,
    ml: 0.5,
  },
});

export const getObjectSlotProps = (slotProps: unknown): Record<string, unknown> =>
  slotProps && typeof slotProps === 'object' ? (slotProps as Record<string, unknown>) : {};

const createValidationRuleList = <TForm extends FieldValues>(
  validations: ValidationConfig<TForm> | undefined,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  },
): string[] => {
  const validationRules: string[] = [];

  if (typeof validations === 'string') {
    validationRules.push(validations);
  } else if (Array.isArray(validations)) {
    validationRules.push(...validations);
  }

  if (options.required && !hasRequiredValidation(validationRules)) {
    validationRules.push('required');
  }

  if (options.minLength !== undefined && !hasRule(validationRules, 'min_length')) {
    validationRules.push(`min_length[${options.minLength}]`);
  }

  if (options.maxLength !== undefined && !hasRule(validationRules, 'max_length')) {
    validationRules.push(`max_length[${options.maxLength}]`);
  }

  return validationRules;
};

const mergeRegisterRules = <TForm extends FieldValues>(
  target: RegisterOptions<TForm>,
  source: RegisterOptions<TForm> | undefined,
) => {
  if (!source) return;

  Object.assign(target, source);

  if (typeof target.validate === 'object' || typeof source.validate === 'object') {
    target.validate = {
      ...(typeof target.validate === 'object' ? target.validate : {}),
      ...(typeof source.validate === 'object' ? source.validate : {}),
    };
  }
};

const hasRule = (rules: string[], ruleName: string): boolean =>
  rules.flatMap(splitValidationRules).some((rule) => rule.split('[')[0] === ruleName);

const isRegisterOptions = <TForm extends FieldValues>(
  validations: ValidationConfig<TForm> | undefined,
): validations is RegisterOptions<TForm> =>
  Boolean(validations && typeof validations === 'object' && !Array.isArray(validations));

const isEquivalentTranslation = (
  value: unknown,
  normalizedTranslation: PartialTranslationField,
  textProperty: TranslationTextProperty,
): boolean => {
  if (!value || typeof value !== 'object') return false;
  const translation = value as PartialTranslationField;
  return (
    translation.locale === normalizedTranslation.locale &&
    getComparableText(getValueByPath(translation, textProperty)) ===
      getComparableText(getValueByPath(normalizedTranslation, textProperty))
  );
};

const getComparableText = (value: unknown): string => (typeof value === 'string' ? value : '');

const getValueByPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, source);

const isFieldError = (value: unknown): value is FieldError =>
  Boolean(value && typeof value === 'object' && 'message' in value);
