'use client';

import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

interface FormInputProps<T extends FieldValues>
  extends
    BaseFormFieldProps<T>,
    Omit<TextFieldProps, 'name' | 'defaultValue' | 'value' | 'onChange' | 'error'> {}

export const FormInput = <T extends FieldValues>({
  name,
  rules,
  helperText,
  ...props
}: FormInputProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const { sx, ...textFieldProps } = props;

        return (
          <TextField
            {...field}
            {...textFieldProps}
            value={field.value ?? ''}
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? helperText}
            fullWidth
            size="small"
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
              ...toSxArray(sx),
            ]}
          />
        );
      }}
    />
  );
};
