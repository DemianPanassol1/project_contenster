'use client';

import { Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { useTranslationFieldState } from './hooks/useTranslationFieldState';
import type { TranslationsFieldsProps } from './types/translations-fields.types';
import {
  TranslationCounter,
  TranslationInput,
  TranslationLanguageSelector,
  TranslationTextArea,
} from './components';

export const TranslationsFields = <TForm extends FieldValues>({
  label,
  languageSelectorLabel,
  name,
  languages,
  textProperty = 'text',
  type = 'input',
  rules,
  validations,
  helperText,
  required,
  minLength,
  maxLength,
  sx,
  ...textFieldProps
}: TranslationsFieldsProps<TForm>) => {
  const focusTargetRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const pendingFocusLanguageIndexRef = useRef<number | null>(null);
  const [focusRequestKey, setFocusRequestKey] = useState(0);
  const {
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
  } = useTranslationFieldState<TForm>({
    name,
    rules,
    languages,
    textProperty,
    required,
    minLength,
    maxLength,
    validations,
  });

  const setFocusTarget = useCallback((target: HTMLInputElement | HTMLTextAreaElement | null) => {
    focusTargetRef.current = target;
  }, []);

  const handleLanguageChangeAndFocus = useCallback(
    (index: number) => {
      pendingFocusLanguageIndexRef.current = index;
      handleLanguageChange(index);
      setFocusRequestKey((currentKey) => currentKey + 1);
    },
    [handleLanguageChange],
  );

  useEffect(() => {
    if (!focusRequestKey || pendingFocusLanguageIndexRef.current !== displayedLanguageIndex) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const target = focusTargetRef.current;

      if (target && !target.disabled) {
        target.focus({ preventScroll: true });
      }

      pendingFocusLanguageIndexRef.current = null;
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [displayedLanguageIndex, focusRequestKey]);

  if (!orderedLanguages.length) {
    return null;
  }

  const selector = hasMultipleLanguages ? (
    <TranslationLanguageSelector
      label={label}
      ariaLabel={languageSelectorLabel}
      languages={orderedLanguages}
      activeLanguageIndex={displayedLanguageIndex}
      filledLanguageIndexes={filledLanguageIndexes}
      visibleStart={displayedVisibleStart}
      onChange={handleLanguageChangeAndFocus}
    />
  ) : undefined;

  const field =
    type === 'textarea' ? (
      <TranslationTextArea<TForm>
        name={selectedFieldName}
        rules={fieldRules}
        label={label}
        helperText={helperText}
        selector={selector}
        setFocusTarget={setFocusTarget}
        required={isRequired}
        minLength={minLength}
        maxLength={maxLength}
        textFieldProps={textFieldProps}
      />
    ) : (
      <TranslationInput<TForm>
        name={selectedFieldName}
        rules={fieldRules}
        label={label}
        helperText={helperText}
        selector={selector}
        setFocusTarget={setFocusTarget}
        required={isRequired}
        minLength={minLength}
        maxLength={maxLength}
        textFieldProps={textFieldProps}
      />
    );

  return (
    <Box
      ref={wrapperRef}
      onFocusCapture={() => setIsFieldActive(true)}
      onMouseDownCapture={() => setIsFieldActive(true)}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }

        setIsFieldActive(false);
      }}
      sx={{
        position: 'relative',
        ...sx,
      }}
    >
      {hasMultipleLanguages && isFieldActive ? (
        <Box
          sx={{
            top: -4,
            right: 0,
            zIndex: 2,
            display: 'flex',
            position: 'absolute',
            justifyContent: 'flex-end',
            pointerEvents: 'none',
            transform: 'translateY(-100%)',
          }}
        >
          <TranslationCounter
            filledCount={filledLanguageIndexes.size}
            totalCount={orderedLanguages.length}
          />
        </Box>
      ) : null}

      {field}

      {normalizedTranslations
        .slice(0, orderedLanguages.length)
        .map((_, index) =>
          index === displayedLanguageIndex ? null : (
            <Controller
              key={`${name}-${orderedLanguages[index]?.locale ?? index}-hidden`}
              name={`${name}.${index}.${textProperty}` as FieldPath<TForm>}
              control={control}
              rules={fieldRules}
              render={({ field }) => (
                <input
                  ref={field.ref}
                  type="hidden"
                  name={field.name}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
              )}
            />
          ),
        )}
    </Box>
  );
};
