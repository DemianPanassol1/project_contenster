'use client';

import type { SxProps, Theme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

import { DATE_VALUE_FORMAT, type EmptyDateValue, parsePickerValue } from './date-picker.util';

interface FormDateProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  disabled?: boolean;
  emptyValue?: EmptyDateValue;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  readOnly?: boolean;
  required?: boolean;
  sx?: SxProps<Theme>;
}

export const FormDate = <T extends FieldValues>({
  name,
  rules,
  helperText,
  disabled,
  emptyValue = '',
  label,
  maxDate,
  minDate,
  readOnly,
  required,
  sx,
}: FormDateProps<T>) => {
  const t = useTranslations('validations');
  const { clearErrors, control, getFieldState, setError } = useFormContext<T>();
  const isRequired = required ?? Boolean(rules?.required);

  const handlePickerError = (hasError: boolean) => {
    if (hasError) {
      setError(name, { type: 'picker', message: t('date') });
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
        <DatePicker
          disabled={disabled}
          label={label}
          maxDate={maxDate}
          minDate={minDate}
          name={field.name}
          readOnly={readOnly}
          value={parsePickerValue(field.value, DATE_VALUE_FORMAT)}
          onChange={(value) =>
            field.onChange(value?.isValid() ? value.format(DATE_VALUE_FORMAT) : emptyValue)
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
                    fontSize: portalFontSize(13),
                  },
                  '& .MuiInputBase-input': {
                    fontSize: portalFontSize(14),
                  },
                  '& .MuiPickersInputBase-root': {
                    fontSize: portalFontSize(14),
                  },
                  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                    color: 'text.secondary',
                    fontSize: portalFontSize(18),
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
