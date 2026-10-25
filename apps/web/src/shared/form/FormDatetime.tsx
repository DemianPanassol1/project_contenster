'use client';

import type { SxProps, Theme } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

import { DATETIME_VALUE_FORMAT, type EmptyDateValue, parsePickerValue } from './date-picker.util';

interface FormDatetimeProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  disabled?: boolean;
  emptyValue?: EmptyDateValue;
  maxDateTime?: Dayjs;
  minDateTime?: Dayjs;
  readOnly?: boolean;
  required?: boolean;
  sx?: SxProps<Theme>;
}

export const FormDatetime = <T extends FieldValues>({
  name,
  rules,
  helperText,
  disabled,
  emptyValue = '',
  label,
  maxDateTime,
  minDateTime,
  readOnly,
  required,
  sx,
}: FormDatetimeProps<T>) => {
  const t = useTranslations('validations');
  const { clearErrors, control, getFieldState, setError } = useFormContext<T>();
  const isRequired = required ?? Boolean(rules?.required);

  const handlePickerError = (hasError: boolean) => {
    if (hasError) {
      setError(name, { type: 'picker', message: t('datetime') });
      return;
    }

    if (getFieldState(name).error?.type === 'picker') {
      clearErrors(name);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <DateTimePicker
          disabled={disabled}
          label={label}
          maxDateTime={maxDateTime}
          minDateTime={minDateTime}
          name={field.name}
          readOnly={readOnly}
          value={parsePickerValue(field.value, DATETIME_VALUE_FORMAT)}
          onChange={(value) =>
            field.onChange(value?.isValid() ? value.format(DATETIME_VALUE_FORMAT) : emptyValue)
          }
          onError={(error) => handlePickerError(error !== null)}
          slotProps={{
            textField: {
              error: Boolean(fieldState.error),
              fullWidth: true,
              helperText: fieldState.error?.message ?? helperText,
              inputRef: field.ref,
              onBlur: field.onBlur,
              required: isRequired,
              size: 'small',
              sx: [
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
                    fontSize: 13,
                  },
                  '& .MuiInputBase-input': {
                    fontSize: 14,
                  },
                  '& .MuiPickersInputBase-root': {
                    fontSize: 14,
                  },
                  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                    color: 'text.secondary',
                    fontSize: 18,
                  },
                  '& .MuiFormHelperText-root': {
                    mr: 0,
                    ml: 0.5,
                  },
                },
                ...toSxArray(sx),
              ],
            },
          }}
        />
      )}
    />
  );
};
