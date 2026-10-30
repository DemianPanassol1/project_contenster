'use client';

import { TextField, type TextFieldProps } from '@mui/material';
import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
} from 'react';
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';
import { NumericFormat, PatternFormat } from 'react-number-format';

import { portalFontSize } from '@/core/theme';
import { type BaseFormFieldProps, type MaskType, type PhoneCountry } from '@/types';
import { toDisplayText, toSxArray } from '@/utils';

import {
  formatCnpjMaskValue,
  isCnpjMaskCharacter,
  normalizeCnpjMaskValue,
} from './masks/cnpj-mask.util';

export type PhonePrefixes = Partial<Record<PhoneCountry, string>>;
export type BrazilianPhoneType = 'mobile' | 'landline' | 'unknown';

type MaskedTextFieldProps = Omit<
  TextFieldProps,
  'name' | 'type' | 'defaultValue' | 'value' | 'onChange' | 'error'
>;

interface FormMaskedInputProps<T extends FieldValues>
  extends BaseFormFieldProps<T>, MaskedTextFieldProps {
  maskType: MaskType;
  decimalScale?: number;
  phoneCountry?: PhoneCountry;
  phonePrefixes?: PhonePrefixes;
  usePhonePrefix?: boolean;
}

interface PhoneMaskedInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  fieldState: ControllerFieldState;
  helperText?: ReactNode;
  phoneCountry?: PhoneCountry;
  phonePrefixes?: PhonePrefixes;
  usePhonePrefix?: boolean;
  textFieldProps: MaskedTextFieldProps;
}

const patternByMaskType: Record<
  Exclude<MaskType, 'currency' | 'percentage' | 'phone'>,
  {
    format: string;
    mask: string;
  }
> = {
  cpf: {
    format: '###.###.###-##',
    mask: '_',
  },
  cnpj: {
    format: '##.###.###/####-##',
    mask: '_',
  },
  cep: {
    format: '#####-###',
    mask: '_',
  },
  caepf: {
    format: '###.###.###/###-##',
    mask: '_',
  },
  rg: {
    format: '##########',
    mask: '_',
  },
};

export const removeNonNumericCharacters = (value: unknown): string => {
  return toDisplayText(value).replace(/\D/g, '');
};

export const getPhonePrefixByCountry = (
  phoneCountry: PhoneCountry | undefined,
  phonePrefixes: PhonePrefixes | undefined,
): string => {
  if (!phoneCountry) {
    return '';
  }

  return removeNonNumericCharacters(phonePrefixes?.[phoneCountry]);
};

export const shouldUsePhonePrefix = (
  usePhonePrefix: boolean | undefined,
  phonePrefix: string,
): boolean => {
  if (!phonePrefix) {
    return false;
  }

  return usePhonePrefix ?? true;
};

export const removePhonePrefix = (value: unknown, phonePrefix: string): string => {
  const digits = removeNonNumericCharacters(value);

  if (phonePrefix && digits.startsWith(phonePrefix)) {
    return digits.slice(phonePrefix.length);
  }

  return digits;
};

export const identifyBrazilianPhoneType = (nationalValue: unknown): BrazilianPhoneType => {
  const digits = removeNonNumericCharacters(nationalValue);

  if (digits.length === 11 && digits[2] === '9') {
    return 'mobile';
  }

  if (digits.length === 10) {
    return 'landline';
  }

  return 'unknown';
};

const getBrazilianPhoneFormat = (nationalValue: string): string => {
  const shouldUseMobileFormat = nationalValue.length > 10 || nationalValue[2] === '9';

  return shouldUseMobileFormat ? '(##) ##### ####' : '(##) #### ####';
};

const getGenericPhoneFormat = (nationalValue: string): string => {
  return '#'.repeat(Math.max(nationalValue.length, 1));
};

export const getPhoneMaskFormat = (
  nationalValue: string,
  phoneCountry: PhoneCountry | undefined,
  phonePrefix: string,
  usePrefix: boolean,
): string => {
  const nationalFormat =
    phoneCountry === 'BR'
      ? getBrazilianPhoneFormat(nationalValue)
      : getGenericPhoneFormat(nationalValue);

  if (!usePrefix) {
    return nationalFormat;
  }

  return `+${phonePrefix} ${nationalFormat}`;
};

export const buildStoredPhoneValue = (
  nationalValue: unknown,
  phonePrefix: string,
  usePrefix: boolean,
): string => {
  const digits = removeNonNumericCharacters(nationalValue);

  if (!digits) {
    return '';
  }

  return usePrefix ? `${phonePrefix}${digits}` : digits;
};

export const normalizeInitialPhoneValue = (
  value: unknown,
  phoneCountry: PhoneCountry | undefined,
  phonePrefixes: PhonePrefixes | undefined,
  usePhonePrefixValue: boolean | undefined,
) => {
  const phonePrefix = getPhonePrefixByCountry(phoneCountry, phonePrefixes);
  const usePrefix = shouldUsePhonePrefix(usePhonePrefixValue, phonePrefix);
  const nationalValue = removePhonePrefix(value, phonePrefix);
  const storedValue = buildStoredPhoneValue(nationalValue, phonePrefix, usePrefix);

  return {
    phonePrefix,
    usePrefix,
    nationalValue,
    storedValue,
    format: getPhoneMaskFormat(nationalValue, phoneCountry, phonePrefix, usePrefix),
  };
};

const normalizeCurrencyCents = (value: unknown): string => {
  const cents = removeNonNumericCharacters(value).replace(/^0+(?=\d)/, '');

  if (!cents) {
    return '';
  }

  return cents;
};

export const currencyNumberToCents = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '';
  }

  return normalizeCurrencyCents(Math.round(value * 100));
};

export const currencyCentsToNumber = (value: unknown): number | '' => {
  const cents = normalizeCurrencyCents(value);

  if (!cents) {
    return '';
  }

  return Number((Number(cents) / 100).toFixed(2));
};

export const centsToNumericFormatValue = (value: unknown): string => {
  const cents = normalizeCurrencyCents(value);

  if (!cents) {
    return '';
  }

  const paddedCents = cents.padStart(3, '0');
  const integerPart = paddedCents.slice(0, -2);
  const decimalPart = paddedCents.slice(-2);

  return `${integerPart}.${decimalPart}`;
};

export const normalizeInitialCurrencyValue = (value: unknown): string => {
  if (typeof value === 'number') {
    return currencyNumberToCents(value);
  }

  return normalizeCurrencyCents(value);
};

export const numericFormatValueToCurrencyNumber = (value: string | undefined): number | '' => {
  const normalizedValue = String(value ?? '').replace(',', '.');
  const [integerPart = '', decimalPart = ''] = normalizedValue.split('.');
  const integerDigits = removeNonNumericCharacters(integerPart);
  const decimalDigits = removeNonNumericCharacters(decimalPart).padEnd(2, '0').slice(0, 2);

  return currencyCentsToNumber(`${integerDigits}${decimalDigits}`);
};

const isKeyboardShortcut = (event: KeyboardEvent<HTMLInputElement>) => {
  return event.ctrlKey || event.metaKey || event.altKey;
};

const isNavigationKey = (key: string) => {
  return [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Tab',
    'Enter',
    'Escape',
  ].includes(key);
};

const PhoneMaskedInput = <T extends FieldValues>({
  field,
  fieldState,
  helperText,
  phoneCountry,
  phonePrefixes,
  usePhonePrefix,
  textFieldProps,
}: PhoneMaskedInputProps<T>) => {
  const phoneValue = normalizeInitialPhoneValue(
    field.value,
    phoneCountry,
    phonePrefixes,
    usePhonePrefix,
  );
  const currentStoredValue = removeNonNumericCharacters(field.value);

  useEffect(() => {
    if (currentStoredValue !== phoneValue.storedValue) {
      field.onChange(phoneValue.storedValue);
    }
  }, [currentStoredValue, field, phoneValue.storedValue]);

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    textFieldProps.onPaste?.(event);

    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();

    const nationalValue = removePhonePrefix(
      event.clipboardData.getData('text'),
      phoneValue.phonePrefix,
    );

    field.onChange(
      buildStoredPhoneValue(nationalValue, phoneValue.phonePrefix, phoneValue.usePrefix),
    );
  };

  return (
    <PatternFormat
      {...textFieldProps}
      sx={[
        {
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
        },
        ...toSxArray(textFieldProps.sx),
      ]}
      name={field.name}
      value={phoneValue.nationalValue}
      error={!!fieldState.error}
      helperText={fieldState.error?.message ?? helperText}
      fullWidth
      size="small"
      customInput={TextField}
      onBlur={field.onBlur}
      getInputRef={field.ref}
      format={phoneValue.format}
      mask="_"
      onPaste={handlePaste}
      onValueChange={(values) => {
        field.onChange(
          buildStoredPhoneValue(values.value, phoneValue.phonePrefix, phoneValue.usePrefix),
        );
      }}
    />
  );
};

export const FormMaskedInput = <T extends FieldValues>({
  name,
  rules,
  helperText,
  maskType,
  decimalScale,
  phoneCountry,
  phonePrefixes,
  usePhonePrefix,
  ...props
}: FormMaskedInputProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const value = field.value ?? '';
        const { sx, ...textFieldProps } = props;
        const commonSx = [
          {
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
              mx: 0,
            },
          },
          ...toSxArray(sx),
        ];

        const commonProps = {
          ...textFieldProps,
          name: field.name,
          value,
          error: !!fieldState.error,
          helperText: fieldState.error?.message ?? helperText,
          fullWidth: true,
          size: 'small' as const,
          sx: commonSx,
          customInput: TextField,
          onBlur: field.onBlur,
          getInputRef: field.ref,
        };

        if (maskType === 'phone') {
          return (
            <PhoneMaskedInput
              field={field}
              fieldState={fieldState}
              helperText={helperText}
              phoneCountry={phoneCountry}
              phonePrefixes={phonePrefixes}
              usePhonePrefix={usePhonePrefix}
              textFieldProps={props}
            />
          );
        }

        if (maskType === 'currency') {
          const centsValue = normalizeInitialCurrencyValue(value);
          const currencyValue = centsToNumericFormatValue(centsValue);

          const handleCurrencyKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
            props.onKeyDown?.(event);

            if (event.defaultPrevented || isKeyboardShortcut(event) || isNavigationKey(event.key)) {
              return;
            }

            if (/^\d$/.test(event.key)) {
              event.preventDefault();
              field.onChange(currencyCentsToNumber(`${centsValue}${event.key}`));

              return;
            }

            if (event.key === 'Backspace') {
              event.preventDefault();
              field.onChange(currencyCentsToNumber(centsValue.slice(0, -1)));

              return;
            }

            if (event.key === 'Delete') {
              event.preventDefault();
              field.onChange('');

              return;
            }

            if (event.key.length === 1) {
              event.preventDefault();
            }
          };

          const handleCurrencyPaste = (event: ClipboardEvent<HTMLInputElement>) => {
            props.onPaste?.(event);

            if (event.defaultPrevented) {
              return;
            }

            event.preventDefault();
            field.onChange(
              currencyCentsToNumber(
                removeNonNumericCharacters(event.clipboardData.getData('text')),
              ),
            );
          };

          return (
            <NumericFormat
              {...commonProps}
              value={currencyValue}
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              decimalSeparator=","
              thousandSeparator="."
              allowNegative={false}
              valueIsNumericString
              onKeyDown={handleCurrencyKeyDown}
              onPaste={handleCurrencyPaste}
            />
          );
        }

        if (maskType === 'percentage') {
          const percentageScale = Math.min(Math.max(Math.trunc(decimalScale ?? 4), 0), 18);
          const percentageValue = toDisplayText(value).replace(',', '.');

          return (
            <NumericFormat
              {...commonProps}
              value={percentageValue}
              decimalScale={percentageScale}
              decimalSeparator=","
              allowedDecimalSeparators={['.', ',']}
              thousandSeparator={false}
              suffix="%"
              allowNegative={false}
              valueIsNumericString
              inputMode="decimal"
              onValueChange={(values) => {
                field.onChange(values.value);
              }}
            />
          );
        }

        if (maskType === 'cnpj') {
          const cnpjValue = normalizeCnpjMaskValue(value);

          const handleCnpjChange = (event: ChangeEvent<HTMLInputElement>) => {
            field.onChange(normalizeCnpjMaskValue(event.target.value));
          };

          const handleCnpjKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
            props.onKeyDown?.(event);

            if (event.defaultPrevented || isKeyboardShortcut(event) || isNavigationKey(event.key)) {
              return;
            }

            if (event.key.length === 1 && !isCnpjMaskCharacter(event.key)) {
              event.preventDefault();
            }
          };

          const handleCnpjPaste = (event: ClipboardEvent<HTMLInputElement>) => {
            props.onPaste?.(event);

            if (event.defaultPrevented) {
              return;
            }

            event.preventDefault();
            field.onChange(normalizeCnpjMaskValue(event.clipboardData.getData('text')));
          };

          return (
            <TextField
              {...textFieldProps}
              name={field.name}
              value={formatCnpjMaskValue(cnpjValue)}
              error={!!fieldState.error}
              helperText={fieldState.error?.message ?? helperText}
              fullWidth
              size="small"
              sx={commonSx}
              onBlur={field.onBlur}
              inputRef={field.ref}
              onChange={handleCnpjChange}
              onKeyDown={handleCnpjKeyDown}
              onPaste={handleCnpjPaste}
            />
          );
        }

        const pattern = patternByMaskType[maskType];

        return (
          <PatternFormat
            {...commonProps}
            format={pattern?.format ?? ''}
            mask={pattern?.mask ?? ''}
            onValueChange={(values) => {
              field.onChange(values.value);
            }}
          />
        );
      }}
    />
  );
};
