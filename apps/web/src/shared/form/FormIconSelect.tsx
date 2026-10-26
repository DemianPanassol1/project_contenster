'use client';

import { Box } from '@mui/material';
import { useMemo } from 'react';
import { type FieldValues, useFormContext } from 'react-hook-form';

import { Icon, type IconName, iconNames, icons } from '@/shared/ui/Icon';
import type { BaseFormFieldProps } from '@/types';

import { FormSelect, type SelectOption } from './FormSelect';

const formatIconLabel = (iconName: string) =>
  iconName
    .split('-')
    .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : part))
    .join(' ');

const iconOptions: SelectOption[] = iconNames.map((iconName) => ({
  value: iconName,
  label: formatIconLabel(iconName),
}));

const isIconName = (value: SelectOption['value']): value is IconName => {
  return typeof value === 'string' && value in icons;
};

const getIconOptions = (currentIcon?: string | null): SelectOption[] => {
  if (!currentIcon || iconOptions.some((option) => option.value === currentIcon)) {
    return iconOptions;
  }

  return [
    {
      value: currentIcon,
      label: currentIcon,
    },
    ...iconOptions,
  ];
};

const renderIconOptionLabel = (option: SelectOption) => (
  <Box
    component="span"
    sx={{
      pl: 1,
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      lineHeight: 1.4,
      paddingRight: '1rem',
    }}
  >
    {isIconName(option.value) && (
      <Icon name={option.value} size={16} strokeWidth={1.9} aria-hidden="true" />
    )}
    <Box
      component="span"
      sx={{
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {option.label}
    </Box>
  </Box>
);

const renderSelectedIconLabel = (option: SelectOption) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 14 }}>
    {isIconName(option.value) && (
      <Icon name={option.value} size={16} strokeWidth={1.9} aria-hidden="true" />
    )}
    {option.label}
  </Box>
);

interface FormIconSelectProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  disabled?: boolean;
}

export const FormIconSelect = <T extends FieldValues>({
  name,
  disabled,
  ...props
}: FormIconSelectProps<T>) => {
  const { watch } = useFormContext<T>();
  const currentValue = watch(name);
  const currentIcon = typeof currentValue === 'string' ? currentValue : null;
  const options = useMemo(() => getIconOptions(currentIcon), [currentIcon]);

  return (
    <FormSelect<T>
      {...props}
      name={name}
      disabled={disabled}
      options={options}
      renderOptionLabel={renderIconOptionLabel}
      renderValue={(value) => (!Array.isArray(value) ? renderSelectedIconLabel(value) : null)}
    />
  );
};
