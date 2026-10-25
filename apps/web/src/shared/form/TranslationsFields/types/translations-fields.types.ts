import type { TextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';
import type { FieldPath, FieldValues, RegisterOptions } from 'react-hook-form';

export type TranslationFieldType = 'input' | 'textarea';

export type TranslationTextProperty = string;

export interface TranslationLocaleOption {
  id: number;
  locale: string;
  name: string;
}

export type ValidationConfig<TForm extends FieldValues> =
  string | string[] | RegisterOptions<TForm>;

export type TranslationTextFieldProps = Omit<
  TextFieldProps,
  'name' | 'type' | 'defaultValue' | 'value' | 'onChange' | 'error' | 'helperText' | 'multiline'
>;

export type PartialTranslationField = { locale?: string; [key: string]: unknown };

type TranslationsFieldsBaseProps<TForm extends FieldValues> = {
  label: ReactNode;
  languageSelectorLabel?: string;
  name: FieldPath<TForm>;
  languages: TranslationLocaleOption[];
  textProperty?: TranslationTextProperty;
  rules?: RegisterOptions<TForm>;
  validations?: ValidationConfig<TForm>;
  helperText?: ReactNode;
  minLength?: number;
};

type TranslationInputFieldProps = {
  type?: Extract<TranslationFieldType, 'input'>;
  maxLength?: never;
};

type TranslationTextAreaFieldProps = {
  type: Extract<TranslationFieldType, 'textarea'>;
  maxLength?: number;
};

export type TranslationsFieldsProps<TForm extends FieldValues> = TranslationTextFieldProps &
  TranslationsFieldsBaseProps<TForm> &
  (TranslationInputFieldProps | TranslationTextAreaFieldProps);

export interface TranslationFieldProps<TForm extends FieldValues> {
  name: FieldPath<TForm>;
  rules?: RegisterOptions<TForm>;
  label: ReactNode;
  helperText?: ReactNode;
  selector?: ReactNode;
  setFocusTarget?: (target: HTMLInputElement | HTMLTextAreaElement | null) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  textFieldProps: TranslationTextFieldProps;
}

export interface TranslationLanguageSelectorProps {
  label: ReactNode;
  ariaLabel?: string;
  languages: TranslationLocaleOption[];
  activeLanguageIndex: number;
  filledLanguageIndexes: Set<number>;
  visibleStart: number;
  onChange: (index: number) => void;
}

export interface TranslationCounterProps {
  filledCount: number;
  totalCount: number;
}
