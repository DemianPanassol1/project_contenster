'use client';

import { Button as BtnMui, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { memo } from 'react';

import { useGlobalContext } from '@/core/providers';

import { Icon, type icons } from './Icon';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  icon?: keyof typeof icons;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  form?: string;
  iconPosition?: 'start' | 'end';
}

export const Button = memo(
  ({
    label,
    onClick = () => {},
    sx = {},
    disabled = false,
    icon = undefined,
    type = 'button',
    variant = 'contained',
    color = 'primary',
    form = 'app-form',
    iconPosition = 'end',
  }: ButtonProps) => {
    const {
      state: { isLoading },
    } = useGlobalContext();

    return (
      <BtnMui
        type={type}
        form={type === 'submit' ? form : undefined}
        onClick={onClick}
        variant={variant}
        disabled={disabled || isLoading}
        loading={isLoading}
        loadingPosition="start"
        startIcon={
          icon && iconPosition === 'start' ? (
            <Icon size={14} name={icon} style={{ marginTop: '0.1rem' }} />
          ) : undefined
        }
        endIcon={
          icon && iconPosition === 'end' ? (
            <Icon size={14} name={icon} style={{ marginTop: '0.1rem' }} />
          ) : undefined
        }
        sx={{
          height: 36,
          px: 1.75,
          borderRadius: '10px',
          fontSize: '12.5px',
          fontWeight: 500,
          textTransform: 'none',
          ...(variant === 'contained' && {
            color: `${color}.contrastText`,
            backgroundColor: `${color}.main`,
            boxShadow: (theme) => `0px 4px 12px -4px ${theme.palette[color].main}55`,
            '&:hover': {
              opacity: 0.95,
              backgroundColor: `${color}.main`,
            },
          }),
          ...(variant === 'outlined' && {
            color: `${color}.main`,
            borderColor: `${color}.main`,
            '&:hover': {
              borderColor: `${color}.dark`,
              backgroundColor: (theme) => alpha(theme.palette[color].main, 0.08),
            },
          }),
          ...(variant === 'text' && {
            color: `${color}.main`,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette[color].main, 0.08),
            },
          }),
          ...sx,
        }}
      >
        {label}
      </BtnMui>
    );
  },
);

Button.displayName = 'Button';
