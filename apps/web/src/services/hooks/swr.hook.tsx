'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { useToast } from '@/hooks';
import { type ApiRequestActionResponse, requestContent } from '@/services/actions';
import { getWebResponseErrorToastMessages } from '@/services/utils/web-error.util';

import type { UseGetResponse, UsePostResponse } from './swr.type';

interface UseGetOptions {
  ignoredErrorStatusCodes?: readonly number[];
  keepLoadingOnTransportError?: boolean;
}

export function useGET<T>(
  endpoint?: string | null,
  revalidate = false,
  options: UseGetOptions = {},
): UseGetResponse<T> {
  const router = useRouter();
  const t = useTranslations();
  const { mutate } = useSWRConfig();
  const { errorMessage } = useToast();
  const webErrorMessages = useMemo(
    () => ({
      connectionError: t('global.connectivity_error_message'),
      defaultError: t('global.default_error_message'),
      timeoutError: t('global.timeout_error_message'),
    }),
    [t],
  );

  const swrKey = endpoint ? (['GET', endpoint] as const) : null;

  const fetcher = async ([, url]: readonly [string, string]): Promise<
    ApiRequestActionResponse<T>
  > => {
    const response = await requestContent<T>({
      method: 'GET',
      endpoint: url,
    });

    if (response.statusCode === 403) {
      router.refresh();
    }

    return response;
  };

  const { data, error, isLoading } = useSWR<
    ApiRequestActionResponse<T>,
    Error,
    readonly ['GET', string] | null
  >(swrKey, fetcher, {
    keepPreviousData: true,
    revalidateOnMount: true,
    revalidateIfStale: revalidate,
    revalidateOnFocus: revalidate,
    revalidateOnReconnect: revalidate,
  });

  const errorKey = useMemo(() => {
    return data?.errors?.map((error) => error.message).join('|') ?? '';
  }, [data?.errors]);

  const lastErrorKeyRef = useRef('');

  useEffect(() => {
    if (!data?.errors?.length) return;
    if (!errorKey) return;
    if (data.statusCode && options.ignoredErrorStatusCodes?.includes(data.statusCode)) return;

    if (lastErrorKeyRef.current === errorKey) return;

    lastErrorKeyRef.current = errorKey;

    getWebResponseErrorToastMessages(data, webErrorMessages).forEach((message) => {
      errorMessage(message);
    });
  }, [
    data,
    data?.errors,
    errorKey,
    errorMessage,
    options.ignoredErrorStatusCodes,
    webErrorMessages,
  ]);

  return {
    data,
    isLoading: Boolean(isLoading || (error && options.keepLoadingOnTransportError !== false)),
    refresh: () => (swrKey ? mutate(swrKey) : Promise.resolve()),
  };
}

export function usePOST<T>(
  endpoint?: string | null,
  body: object = {},
  revalidate = false,
): UsePostResponse<T> {
  const router = useRouter();
  const t = useTranslations();
  const { mutate } = useSWRConfig();
  const { errorMessage } = useToast();
  const webErrorMessages = useMemo(
    () => ({
      connectionError: t('global.connectivity_error_message'),
      defaultError: t('global.default_error_message'),
      timeoutError: t('global.timeout_error_message'),
    }),
    [t],
  );

  const swrKey = endpoint ? (['POST', endpoint, body] as const) : null;

  const fetcher = async ([, url, payload]: readonly [string, string, object]): Promise<
    ApiRequestActionResponse<T>
  > => {
    const response = await requestContent<T>({
      method: 'POST',
      endpoint: url,
      body: payload,
    });

    if (response.statusCode === 403) {
      router.refresh();
    }

    return response;
  };

  const { data, error, isLoading } = useSWR<
    ApiRequestActionResponse<T>,
    Error,
    readonly ['POST', string, object] | null
  >(swrKey, fetcher, {
    keepPreviousData: true,
    revalidateOnMount: true,
    revalidateIfStale: revalidate,
    revalidateOnFocus: revalidate,
    revalidateOnReconnect: revalidate,
  });

  const errorKey = useMemo(() => {
    return data?.errors?.map((error) => error.message).join('|') ?? '';
  }, [data?.errors]);

  const lastErrorKeyRef = useRef('');

  useEffect(() => {
    if (!data?.errors?.length) return;
    if (!errorKey) return;

    if (lastErrorKeyRef.current === errorKey) return;

    lastErrorKeyRef.current = errorKey;

    getWebResponseErrorToastMessages(data, webErrorMessages).forEach((message) => {
      errorMessage(message);
    });
  }, [data, data?.errors, errorKey, errorMessage, webErrorMessages]);

  return {
    data,
    isLoading: Boolean(isLoading || error),
    refresh: () => (swrKey ? mutate(swrKey) : Promise.resolve()),
  };
}
