import { InputAdornment, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { toSxArray } from '@/utils';

import type { TranslationFieldProps } from '../types/translations-fields.types';
import { getBaseTextFieldSx, getObjectSlotProps } from '../utils/translations-fields.util';

export const TranslationInput = <TForm extends FieldValues>({
  name,
  rules,
  label,
  helperText,
  selector,
  setFocusTarget,
  required,
  minLength,
  maxLength,
  textFieldProps,
}: TranslationFieldProps<TForm>) => {
  const { control } = useFormContext<TForm>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const { ref, ...controllerField } = field;
        const { sx, slotProps, ...props } = textFieldProps;
        const inputSlotProps = getObjectSlotProps(slotProps?.input);
        const htmlInputSlotProps = getObjectSlotProps(slotProps?.htmlInput);
        const inputEndAdornment = inputSlotProps.endAdornment as ReactNode;

        return (
          <TextField
            {...controllerField}
            {...props}
            label={label}
            required={required}
            value={field.value ?? ''}
            inputRef={(target: HTMLInputElement | null) => {
              ref(target);
              setFocusTarget?.(target);
            }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? helperText}
            fullWidth
            size="small"
            slotProps={{
              ...slotProps,
              htmlInput: {
                ...htmlInputSlotProps,
                minLength,
                maxLength,
              },
              input: {
                ...inputSlotProps,
                endAdornment: selector ? (
                  <InputAdornment position="end" sx={{ ml: 0.75 }}>
                    {selector}
                  </InputAdornment>
                ) : (
                  inputEndAdornment
                ),
              },
            }}
            sx={[
              getBaseTextFieldSx(),
              {
                '& .MuiOutlinedInput-root': {
                  pr: selector ? 0.5 : undefined,
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
