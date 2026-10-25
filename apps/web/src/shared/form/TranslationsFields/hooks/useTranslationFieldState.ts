import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type FieldPath, type FieldValues, useFormContext, useWatch } from 'react-hook-form';

import { useValidationRules } from '@/hooks';

import type { TranslationsFieldsProps } from '../types/translations-fields.types';
import {
  alignTranslationsWithLanguages,
  areEquivalentTranslations,
  clampVisibleStart,
  createTranslationRules,
  getNextVisibleStart,
  getTranslationTextError,
  getVisibleStartForIndex,
  hasRequiredValidation,
  isFilledTranslation,
  orderTranslationLanguages,
} from '../utils/translations-fields.util';

interface UseTranslationFieldStateParams<TForm extends FieldValues> {
  name: FieldPath<TForm>;
  languages: TranslationsFieldsProps<TForm>['languages'];
  textProperty: NonNullable<TranslationsFieldsProps<TForm>['textProperty']>;
  rules: TranslationsFieldsProps<TForm>['rules'];
  validations: TranslationsFieldsProps<TForm>['validations'];
  required: TranslationsFieldsProps<TForm>['required'];
  minLength: TranslationsFieldsProps<TForm>['minLength'];
  maxLength: TranslationsFieldsProps<TForm>['maxLength'];
}

export const useTranslationFieldState = <TForm extends FieldValues>({
  name,
  languages,
  textProperty,
  rules,
  validations,
  required,
  minLength,
  maxLength,
}: UseTranslationFieldStateParams<TForm>) => {
  const locale = useLocale();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isFieldActive, setIsFieldActive] = useState(false);
  const [hasManualLanguageSelection, setHasManualLanguageSelection] = useState(false);
  const { createValidationRules } = useValidationRules<TForm>();
  const fieldName = name;
  const [activeLanguageIndex, setActiveLanguageIndex] = useState(0);
  const [visibleStart, setVisibleStart] = useState(0);
  const [lastManualSubmitCount, setLastManualSubmitCount] = useState(0);
  const {
    control,
    setValue,
    formState: { errors, submitCount },
  } = useFormContext<TForm>();
  const currentValue = useWatch({ control, name: fieldName });
  const orderedLanguages = useMemo(
    () => orderTranslationLanguages(languages, locale),
    [languages, locale],
  );
  const localeLanguageIndex = useMemo(() => {
    const normalizedLocale = locale;
    const currentIndex = orderedLanguages.findIndex(
      (language) => language.locale === normalizedLocale,
    );

    return currentIndex >= 0 ? currentIndex : 0;
  }, [locale, orderedLanguages]);
  const normalizedTranslations = useMemo(
    () => alignTranslationsWithLanguages(currentValue, orderedLanguages),
    [currentValue, orderedLanguages],
  );
  const fieldRules = useMemo(
    () =>
      createTranslationRules(rules, validations, createValidationRules, {
        required,
        minLength,
        maxLength,
      }),
    [createValidationRules, maxLength, minLength, required, rules, validations],
  );
  const isRequired = useMemo(
    () => Boolean(required || hasRequiredValidation(validations) || rules?.required),
    [required, rules?.required, validations],
  );
  const selectedLanguageIndex = hasManualLanguageSelection
    ? activeLanguageIndex
    : localeLanguageIndex;
  const safeActiveLanguageIndex = Math.min(
    selectedLanguageIndex,
    Math.max(orderedLanguages.length - 1, 0),
  );
  const firstErrorIndex = useMemo(
    () =>
      submitCount > lastManualSubmitCount
        ? normalizedTranslations
            .slice(0, orderedLanguages.length)
            .findIndex((_, index) =>
              Boolean(getTranslationTextError(errors, name, index, textProperty)),
            )
        : -1,
    [
      errors,
      lastManualSubmitCount,
      name,
      normalizedTranslations,
      orderedLanguages.length,
      submitCount,
      textProperty,
    ],
  );
  const displayedLanguageIndex = firstErrorIndex >= 0 ? firstErrorIndex : safeActiveLanguageIndex;
  const displayedVisibleStart =
    firstErrorIndex >= 0
      ? getVisibleStartForIndex(firstErrorIndex, orderedLanguages.length)
      : clampVisibleStart(visibleStart, orderedLanguages.length);
  const selectedFieldName = `${name}.${displayedLanguageIndex}.${textProperty}` as FieldPath<TForm>;
  const hasMultipleLanguages = orderedLanguages.length > 1;
  const filledLanguageIndexes = useMemo(
    () =>
      new Set(
        normalizedTranslations
          .slice(0, orderedLanguages.length)
          .map((translation, index) =>
            isFilledTranslation(getValueByPath(translation, textProperty)) ? index : null,
          )
          .filter((index): index is number => index !== null),
      ),
    [normalizedTranslations, orderedLanguages.length, textProperty],
  );

  useEffect(() => {
    if (areEquivalentTranslations(currentValue, normalizedTranslations, textProperty)) {
      return;
    }

    setValue(fieldName, normalizedTranslations as never, { shouldDirty: false });
  }, [currentValue, fieldName, normalizedTranslations, setValue, textProperty]);

  const handleLanguageChange = (index: number) => {
    setHasManualLanguageSelection(true);
    setActiveLanguageIndex(index);
    setVisibleStart(getNextVisibleStart(index, displayedVisibleStart, orderedLanguages.length));
    setLastManualSubmitCount(submitCount);
    setIsFieldActive(true);
  };

  return {
    control,
    orderedLanguages,
    wrapperRef,
    fieldRules,
    isRequired,
    isFieldActive,
    selectedFieldName,
    hasMultipleLanguages,
    displayedVisibleStart,
    displayedLanguageIndex,
    filledLanguageIndexes,
    normalizedTranslations,
    setIsFieldActive,
    handleLanguageChange,
  };
};

const getValueByPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;

    return (current as Record<string, unknown>)[key];
  }, source);
