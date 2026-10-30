'use client';

import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import { Icon } from '@/shared/ui';
import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

interface FormPasswordInputProps<T extends FieldValues>
  extends
    BaseFormFieldProps<T>,
    Omit<TextFieldProps, 'name' | 'type' | 'defaultValue' | 'value' | 'onChange' | 'error'> {
  autoHideMs?: number;
}

export const FormPasswordInput = <T extends FieldValues>({
  name,
  rules,
  helperText,
  autoHideMs = 5000,
  ...props
}: FormPasswordInputProps<T>) => {
  const t = useTranslations();
  const { control } = useFormContext<T>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => setVisible(false), autoHideMs);

    return () => clearTimeout(timeout);
  }, [visible, autoHideMs]);

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
            type={visible ? 'text' : 'password'}
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
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label={t(visible ? 'global.hide_password' : 'global.show_password')}
                      aria-pressed={visible}
                      onClick={() => setVisible((state) => !state)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        );
      }}
    />
  );
};
