'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import type { ApiRequestActionResponse } from '@/services/actions';
import { getWebResponseErrorToastMessages } from '@/services/utils';

import { useToast } from './toast.hook';

export const useWebResponseErrorToast = () => {
  const t = useTranslations('global');
  const { errorMessage } = useToast();

  return useCallback(
    (response: Pick<ApiRequestActionResponse<unknown>, 'errors'>) => {
      getWebResponseErrorToastMessages(response, {
        connectionError: t('connectivity_error_message'),
        defaultError: t('default_error_message'),
        timeoutError: t('timeout_error_message'),
      }).forEach(errorMessage);
    },
    [errorMessage, t],
  );
};
