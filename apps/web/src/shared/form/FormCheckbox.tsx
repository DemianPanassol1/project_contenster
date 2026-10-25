'use client';

import {
  Checkbox,
  type CheckboxProps,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

interface FormCheckboxProps<T extends FieldValues>
  extends
    BaseFormFieldProps<T>,
    Omit<CheckboxProps, 'name' | 'defaultValue' | 'value' | 'onChange' | 'error'> {}

export const FormCheckbox = <T extends FieldValues>({
  name,
  rules,
  label,
  helperText,
  disabled,
  ...props
}: FormCheckboxProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        return (
          <FormControl error={!!fieldState.error} disabled={disabled}>
            <FormControlLabel
              label={label}
              sx={{
                m: 0,
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  fontSize: 13,
                  fontWeight: 500,
                },
              }}
              control={
                <Checkbox
                  {...props}
                  name={field.name}
                  checked={!!field.value}
                  disabled={disabled}
                  onBlur={field.onBlur}
                  onChange={(_, checked) => field.onChange(checked)}
                  sx={[
                    {
                      color: 'primary.main',
                      '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                        color: 'primary.main',
                      },
                    },
                    ...toSxArray(props.sx),
                  ]}
                  slotProps={{
                    input: {
                      ref: field.ref,
                    },
                  }}
                />
              }
            />

            {(fieldState.error?.message || helperText) && (
              <FormHelperText sx={{ mr: 0, ml: 0.5 }}>
                {fieldState.error?.message ?? helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};
