'use client';

import { Box, TextField, type TextFieldProps } from '@mui/material';
import { useEffect } from 'react';
import { type FieldValues, useController, useFormContext } from 'react-hook-form';

import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

interface FormTextAreaProps<T extends FieldValues>
  extends
    BaseFormFieldProps<T>,
    Omit<TextFieldProps, 'name' | 'defaultValue' | 'value' | 'onChange' | 'error' | 'multiline'> {
  maxLength?: number;
}

export const FormTextArea = <T extends FieldValues>({
  name,
  rules,
  helperText,
  minRows = 4,
  maxRows = 8,
  maxLength,
  ...props
}: FormTextAreaProps<T>) => {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({
    name,
    control,
    rules,
  });
  const characterLimit = maxLength === undefined ? undefined : Math.max(0, Math.trunc(maxLength));
  const fieldValue = String(field.value ?? '');
  const limitedValue =
    characterLimit === undefined ? fieldValue : fieldValue.slice(0, characterLimit);
  const { onChange } = field;
  const { sx, slotProps, ...textFieldProps } = props;
  const htmlInputSlotProps =
    slotProps?.htmlInput && typeof slotProps.htmlInput === 'object' ? slotProps.htmlInput : {};

  useEffect(() => {
    if (fieldValue !== limitedValue) {
      onChange(limitedValue);
    }
  }, [fieldValue, limitedValue, onChange]);

  return (
    <TextField
      {...field}
      {...textFieldProps}
      multiline
      minRows={minRows}
      maxRows={maxRows}
      value={limitedValue}
      onChange={(event) => {
        const nextValue =
          characterLimit === undefined
            ? event.target.value
            : event.target.value.slice(0, characterLimit);

        onChange(nextValue);
      }}
      error={!!fieldState.error}
      helperText={
        characterLimit !== undefined ? (
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box component="span">{fieldState.error?.message ?? helperText}</Box>
            <Box
              component="span"
              sx={{
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {limitedValue.length}/{characterLimit}
            </Box>
          </Box>
        ) : (
          (fieldState.error?.message ?? helperText)
        )
      }
      fullWidth
      size="small"
      slotProps={{
        ...slotProps,
        htmlInput: {
          ...htmlInputSlotProps,
          ...(characterLimit !== undefined ? { maxLength: characterLimit } : {}),
        },
      }}
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
            fontSize: 13,
          },
          '& .MuiInputBase-input': {
            fontSize: 14,
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
};
