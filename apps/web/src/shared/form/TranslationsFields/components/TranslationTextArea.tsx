import { Box, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { toSxArray } from '@/utils';

import type { TranslationFieldProps } from '../types/translations-fields.types';
import { getBaseTextFieldSx, getObjectSlotProps } from '../utils/translations-fields.util';

export const TranslationTextArea = <TForm extends FieldValues>({
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
  const { minRows = 4, maxRows = 8 } = textFieldProps;

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
        const textLength = String(field.value ?? '').length;

        return (
          <TextField
            {...controllerField}
            {...props}
            label={label}
            required={required}
            multiline
            minRows={minRows}
            maxRows={maxRows}
            value={field.value ?? ''}
            inputRef={(target: HTMLInputElement | HTMLTextAreaElement | null) => {
              ref(target);
              setFocusTarget?.(target);
            }}
            error={!!fieldState.error}
            helperText={
              maxLength ? (
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
                    {textLength}/{maxLength}
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
                minLength,
                maxLength,
              },
              input: {
                ...inputSlotProps,
                endAdornment: selector ? (
                  <>
                    {inputEndAdornment}
                    <Box
                      sx={{
                        right: 8,
                        bottom: 8,
                        position: 'absolute',
                      }}
                    >
                      {selector}
                    </Box>
                  </>
                ) : (
                  inputEndAdornment
                ),
              },
            }}
            sx={[
              getBaseTextFieldSx(),
              {
                '& .MuiOutlinedInput-root': {
                  position: 'relative',
                  alignItems: 'flex-start',
                  pb: selector ? 4.25 : undefined,
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
