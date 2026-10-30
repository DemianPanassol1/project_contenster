'use client';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
  type SwitchProps,
} from '@mui/material';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

interface FormSwitchProps<T extends FieldValues>
  extends
    BaseFormFieldProps<T>,
    Omit<SwitchProps, 'name' | 'defaultValue' | 'value' | 'onChange' | 'error'> {}

export const FormSwitch = <T extends FieldValues>({
  name,
  rules,
  label,
  helperText,
  disabled,
  ...props
}: FormSwitchProps<T>) => {
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
                  fontSize: portalFontSize(13),
                  fontWeight: 500,
                },
              }}
              control={
                <Switch
                  {...props}
                  name={field.name}
                  checked={!!field.value}
                  disabled={disabled}
                  onBlur={field.onBlur}
                  onChange={(_, checked) => field.onChange(checked)}
                  sx={[
                    {
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'primary.dark',
                        '& + .MuiSwitch-track': {
                          bgcolor: 'primary.dark',
                        },
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
