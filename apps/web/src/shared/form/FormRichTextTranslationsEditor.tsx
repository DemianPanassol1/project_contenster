'use client';

import { Box, type SxProps, type Theme } from '@mui/material';
import { type FocusEvent, useCallback, useState } from 'react';
import { Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { toSxArray } from '@/utils';

import { TranslationCounter, TranslationLanguageSelector } from './TranslationsFields/components';
import { useTranslationFieldState } from './TranslationsFields/hooks/useTranslationFieldState';
import type { TranslationsFieldsProps } from './TranslationsFields/types/translations-fields.types';
import { FormRichTextEditor } from './FormRichTextEditor';

export type FormRichTextTranslationsEditorProps<TForm extends FieldValues> = Pick<
  TranslationsFieldsProps<TForm>,
  | 'label'
  | 'name'
  | 'languages'
  | 'rules'
  | 'validations'
  | 'helperText'
  | 'textProperty'
  | 'required'
  | 'minLength'
  | 'maxLength'
> & {
  disabled?: boolean;
  minHeight?: number;
  sx?: SxProps<Theme>;
};

export const FormRichTextTranslationsEditor = <TForm extends FieldValues>({
  label,
  name,
  languages,
  textProperty = 'text',
  rules,
  validations,
  helperText,
  required,
  minLength,
  maxLength,
  disabled = false,
  minHeight,
  sx,
}: FormRichTextTranslationsEditorProps<TForm>) => {
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

  const handleLanguageChangeAndFocus = useCallback(
    (index: number) => {
      handleLanguageChange(index);
      setFocusRequestKey((currentKey) => currentKey + 1);
    },
    [handleLanguageChange],
  );

  if (!orderedLanguages.length) {
    return null;
  }

  const selector = hasMultipleLanguages ? (
    <TranslationLanguageSelector
      label={label}
      languages={orderedLanguages}
      activeLanguageIndex={displayedLanguageIndex}
      filledLanguageIndexes={filledLanguageIndexes}
      visibleStart={displayedVisibleStart}
      onChange={handleLanguageChangeAndFocus}
    />
  ) : undefined;

  return (
    <Box
      ref={wrapperRef}
      onFocusCapture={() => setIsFieldActive(true)}
      onMouseDownCapture={() => setIsFieldActive(true)}
      onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }

        setIsFieldActive(false);
      }}
      sx={[
        {
          position: 'relative',
        },
        ...toSxArray(sx),
      ]}
    >
      {hasMultipleLanguages && isFieldActive ? (
        <Box
          sx={{
            top: 20,
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

      <FormRichTextEditor<TForm>
        name={selectedFieldName}
        rules={fieldRules}
        label={label}
        helperText={helperText}
        required={isRequired}
        disabled={disabled}
        minHeight={minHeight}
        focusRequestKey={focusRequestKey || undefined}
        toolbarEndAdornment={selector}
      />

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
