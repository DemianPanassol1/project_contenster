'use client';

import {
  Autocomplete,
  type AutocompleteProps,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Controller, type FieldValues, useFormContext } from 'react-hook-form';

import {
  type FetchOptionsResponse,
  type OptionsBody,
  type OptionsMethod,
  type SelectOption,
  useOptions,
} from '@/services/hooks';
import { type BaseFormFieldProps } from '@/types';
import { toSxArray } from '@/utils';

export type { SelectOption } from '@/services/hooks';

type AutocompleteBaseProps = Omit<
  AutocompleteProps<SelectOption, boolean, boolean, false>,
  'renderInput' | 'options' | 'value' | 'onChange' | 'loading' | 'disabled' | 'multiple'
>;

interface FormSelectProps<T extends FieldValues>
  extends BaseFormFieldProps<T>, AutocompleteBaseProps {
  multiple?: boolean;
  options?: SelectOption[];
  optionsEndpoint?: string | null;
  optionsMethod?: OptionsMethod;
  optionsBody?: OptionsBody;
  revalidateOptions?: boolean;
  fetchOptions?: () => Promise<FetchOptionsResponse>;
  renderOptionLabel?: (option: SelectOption) => ReactNode;
  onValueChange?: (value: SelectOption['value'] | SelectOption['value'][] | null) => void;
  disabled?: boolean;
  textFieldProps?: Omit<
    TextFieldProps,
    | 'name'
    | 'label'
    | 'value'
    | 'onChange'
    | 'error'
    | 'helperText'
    | 'inputRef'
    | 'inputProps'
    | 'InputProps'
    | 'slotProps'
  >;
}

export const FormSelect = <T extends FieldValues>({
  name,
  rules,
  label,
  helperText,
  multiple = false,
  options = [],
  optionsEndpoint,
  optionsMethod = 'GET',
  optionsBody = {},
  revalidateOptions = false,
  fetchOptions,
  renderOptionLabel,
  onValueChange,
  disabled,
  textFieldProps,
  ...props
}: FormSelectProps<T>) => {
  const { control } = useFormContext<T>();
  const {
    sx: autocompleteSx,
    renderValue: renderValueProp,
    renderOption: renderOptionProp,
    ...autocompleteProps
  } = props;
  const { options: finalOptions, isLoading } = useOptions({
    options,
    optionsEndpoint,
    optionsMethod,
    optionsBody,
    revalidateOptions,
    fetchOptions,
  });

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const fieldValue: unknown = field.value;
        const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
        const selectedValue = multiple
          ? finalOptions.filter((option) => selectedValues.includes(option.value))
          : (finalOptions.find((option) => option.value === fieldValue) ?? null);

        return (
          <Autocomplete
            {...autocompleteProps}
            multiple={multiple}
            options={finalOptions}
            value={selectedValue}
            loading={isLoading}
            disabled={disabled}
            getOptionDisabled={(option) => !!option.disabled}
            getOptionKey={(option) => String(option.value)}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            renderOption={
              renderOptionProp ??
              (renderOptionLabel
                ? (optionProps, option) => {
                    const { key: _key, ...currentOptionProps } = optionProps;

                    return (
                      <li key={String(option.value)} {...currentOptionProps}>
                        {renderOptionLabel(option)}
                      </li>
                    );
                  }
                : undefined)
            }
            renderValue={
              renderValueProp ??
              (!multiple && renderOptionLabel
                ? (value) => (!Array.isArray(value) ? renderOptionLabel(value) : null)
                : undefined)
            }
            onChange={(_, option) => {
              if (multiple) {
                const value = Array.isArray(option) ? option.map((item) => item.value) : [];

                field.onChange(value);
                onValueChange?.(value);

                return;
              }

              const value = !Array.isArray(option) ? (option?.value ?? null) : null;

              field.onChange(value);
              onValueChange?.(value);
            }}
            renderInput={(params) =>
              (() => {
                const { sx: textFieldSx, ...currentTextFieldProps } = textFieldProps ?? {};

                return (
                  <TextField
                    {...currentTextFieldProps}
                    {...params}
                    label={label}
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
                      ...toSxArray(textFieldSx),
                    ]}
                    onBlur={(event) => {
                      field.onBlur();
                      textFieldProps?.onBlur?.(event);
                    }}
                  />
                );
              })()
            }
            sx={[
              (theme) => ({
                width: '100%',
                minWidth: 0,
                '& .MuiAutocomplete-inputRoot': {
                  gap: 0.5,
                  alignItems: 'center',
                  fontSize: 14,
                  flexWrap: multiple ? 'wrap' : 'nowrap',
                  maxHeight: multiple ? 92 : undefined,
                  overflowY: multiple ? 'auto' : undefined,
                },
                '& .MuiAutocomplete-input': {
                  fontSize: 14,
                  minWidth: multiple ? '56px !important' : 0,
                },
                '& .MuiAutocomplete-tag': {
                  maxWidth: 150,
                  margin: '2px',
                },
                '& .MuiChip-root': {
                  height: 24,
                  maxWidth: 150,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                  fontSize: 12,
                  fontWeight: 600,
                },
                '& .MuiChip-label': {
                  minWidth: 0,
                  px: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                },
                '& .MuiChip-deleteIcon': {
                  width: 16,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                  },
                },
              }),
              ...toSxArray(autocompleteSx),
            ]}
            slotProps={{
              popper: {
                sx: (theme) => ({
                  zIndex: theme.zIndex.modal + 10,
                }),
              },
              paper: {
                sx: {
                  '& .MuiAutocomplete-option': {
                    fontSize: 13,
                  },
                },
              },
            }}
          />
        );
      }}
    />
  );
};
