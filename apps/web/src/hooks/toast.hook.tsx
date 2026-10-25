'use client';

import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

import { useToastOptions } from '@/core/providers/contexts/snackbar.context';

type ToastVariant = 'default' | 'error' | 'info' | 'success' | 'warning';

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();
  const toastOptions = useToastOptions();

  const show = useCallback(
    (message: string, variant: ToastVariant) => {
      enqueueSnackbar(message, { variant, ...toastOptions });
    },
    [enqueueSnackbar, toastOptions],
  );

  const defaultMessage = useCallback((message: string) => show(message, 'default'), [show]);

  const warnMessage = useCallback((message: string) => show(message, 'warning'), [show]);

  const infoMessage = useCallback((message: string) => show(message, 'info'), [show]);

  const successMessage = useCallback((message: string) => show(message, 'success'), [show]);

  const errorMessage = useCallback((message: string) => show(message, 'error'), [show]);

  return {
    defaultMessage,
    errorMessage,
    infoMessage,
    successMessage,
    warnMessage,
  };
}
