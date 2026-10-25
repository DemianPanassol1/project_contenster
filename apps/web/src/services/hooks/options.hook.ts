'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { useToast } from '@/hooks';
import { requestContent } from '@/services/actions/content.action';
import { getWebResponseErrorToastMessages } from '@/services/utils/web-error.util';

import { useGET, usePOST } from './swr.hook';

export interface SelectOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean | null;
  metadata?: Record<string, unknown> | null;
}

export type OptionsMethod = 'GET' | 'POST';
export type OptionsBody = Record<string, unknown>;

export type OptionsResponseBody =
  | SelectOption[]
  | {
      items?: SelectOption[];
    };

export type FetchOptionsResponse =
  | SelectOption[]
  | {
      body?: OptionsResponseBody;
    };

export interface UseOptionsParams {
  options?: SelectOption[];
  optionsEndpoint?: string | null;
  optionsMethod?: OptionsMethod;
  optionsBody?: OptionsBody;
  revalidateOptions?: boolean;
  fetchOptions?: () => Promise<FetchOptionsResponse>;
}

export interface OptionsSource extends UseOptionsParams {
  key: string;
}

export type OptionsByKey = Record<string, SelectOption[]>;

interface OptionsSourceSnapshot {
  key: string;
  options: SelectOption[];
  optionsEndpoint: string | null;
  optionsMethod: OptionsMethod;
  optionsBody: OptionsBody;
}

const EMPTY_OPTIONS: SelectOption[] = [];

export const normalizeOptionsBody = (response?: OptionsResponseBody | null): SelectOption[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.items ?? [];
};

export const normalizeFetchOptionsResponse = (response: FetchOptionsResponse): SelectOption[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return normalizeOptionsBody(response.body);
};

export const useOptions = ({
  options = [],
  optionsEndpoint,
  optionsMethod = 'GET',
  optionsBody = {},
  revalidateOptions = false,
  fetchOptions,
}: UseOptionsParams) => {
  const [remoteOptions, setRemoteOptions] = useState<SelectOption[]>([]);
  const [isLoadingFetchOptions, setIsLoadingFetchOptions] = useState(false);

  const getOptions = useGET<OptionsResponseBody>(
    optionsMethod === 'GET' ? optionsEndpoint : null,
    revalidateOptions,
  );
  const postOptions = usePOST<OptionsResponseBody>(
    optionsMethod === 'POST' ? optionsEndpoint : null,
    optionsBody,
    revalidateOptions,
  );

  const endpointOptions = useMemo(() => {
    const response = optionsMethod === 'GET' ? getOptions.data : postOptions.data;

    if (!response?.success) {
      return [];
    }

    return normalizeOptionsBody(response.body);
  }, [getOptions.data, optionsMethod, postOptions.data]);

  const isLoadingEndpointOptions =
    optionsMethod === 'GET' ? getOptions.isLoading : postOptions.isLoading;

  const finalOptions = useMemo(
    () => [...options, ...endpointOptions, ...remoteOptions],
    [endpointOptions, options, remoteOptions],
  );

  useEffect(() => {
    if (!fetchOptions) return;

    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsLoadingFetchOptions(true);

        const response = await fetchOptions();

        if (!isMounted) return;

        setRemoteOptions(normalizeFetchOptionsResponse(response));
      } finally {
        if (isMounted) {
          setIsLoadingFetchOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, [fetchOptions]);

  return {
    options: finalOptions,
    isLoading: isLoadingEndpointOptions || isLoadingFetchOptions,
  };
};

const createOptionsSourceSnapshots = (sources: OptionsSource[]): OptionsSourceSnapshot[] =>
  sources.map(
    ({ key, options = [], optionsEndpoint, optionsMethod = 'GET', optionsBody = {} }) => ({
      key,
      options,
      optionsEndpoint: optionsEndpoint ?? null,
      optionsMethod,
      optionsBody,
    }),
  );

const buildOptionsSourcesKey = (sources: OptionsSource[]): string =>
  JSON.stringify(createOptionsSourceSnapshots(sources));

const parseOptionsSourceSnapshots = (sourcesKey: string): OptionsSourceSnapshot[] => {
  try {
    const value = JSON.parse(sourcesKey) as unknown;

    return Array.isArray(value)
      ? value.map(toOptionsSourceSnapshot).filter(isOptionsSourceSnapshot)
      : [];
  } catch {
    return [];
  }
};

const toOptionsSourceSnapshot = (value: unknown): OptionsSourceSnapshot | null => {
  if (!isObjectRecord(value) || typeof value.key !== 'string') {
    return null;
  }

  return {
    key: value.key,
    options: Array.isArray(value.options) ? value.options.filter(isSelectOption) : [],
    optionsEndpoint: typeof value.optionsEndpoint === 'string' ? value.optionsEndpoint : null,
    optionsMethod: value.optionsMethod === 'POST' ? 'POST' : 'GET',
    optionsBody: isObjectRecord(value.optionsBody) ? value.optionsBody : {},
  };
};

const isOptionsSourceSnapshot = (
  value: OptionsSourceSnapshot | null,
): value is OptionsSourceSnapshot => Boolean(value);

const isSelectOption = (value: unknown): value is SelectOption => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    ['string', 'number', 'boolean'].includes(typeof value.value) && typeof value.label === 'string'
  );
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

export const useOptionsCollection = (sources: OptionsSource[]) => {
  const router = useRouter();
  const t = useTranslations();
  const { errorMessage } = useToast();
  const [remoteOptions, setRemoteOptions] = useState<OptionsByKey>({});
  const [isLoading, setIsLoading] = useState(false);
  const webErrorMessages = useMemo(
    () => ({
      connectionError: t('global.connectivity_error_message'),
      defaultError: t('global.default_error_message'),
      timeoutError: t('global.timeout_error_message'),
    }),
    [t],
  );
  const sourcesKey = useMemo(() => buildOptionsSourcesKey(sources), [sources]);
  const sourceSnapshots = useMemo(() => parseOptionsSourceSnapshots(sourcesKey), [sourcesKey]);
  const staticOptions = useMemo(() => {
    return sourceSnapshots.reduce<OptionsByKey>((acc, source) => {
      acc[source.key] = source.options ?? [];

      return acc;
    }, {});
  }, [sourceSnapshots]);

  useEffect(() => {
    const endpointSources = sourceSnapshots.filter((source) => source.optionsEndpoint);

    if (!endpointSources.length) {
      return;
    }

    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsLoading(true);

        const entries = await Promise.all(
          endpointSources.map(async (source) => {
            const method = source.optionsMethod ?? 'GET';
            const response = await requestContent<OptionsResponseBody>({
              method,
              endpoint: source.optionsEndpoint as string,
              body: method === 'POST' ? (source.optionsBody ?? {}) : undefined,
            });

            if (response.statusCode === 401) {
              router.refresh();
            }

            if (!response.success) {
              getWebResponseErrorToastMessages(response, webErrorMessages).forEach((message) =>
                errorMessage(message),
              );
              return [source.key, EMPTY_OPTIONS] as const;
            }

            return [source.key, normalizeOptionsBody(response.body)] as const;
          }),
        );

        if (!isMounted) return;

        const nextRemoteOptions = entries.reduce<OptionsByKey>((acc, [key, value]) => {
          acc[key] = value.length ? value : EMPTY_OPTIONS;

          return acc;
        }, {});

        setRemoteOptions(nextRemoteOptions);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, [errorMessage, router, sourceSnapshots, webErrorMessages]);

  const options = useMemo(() => {
    return sourceSnapshots.reduce<OptionsByKey>((acc, source) => {
      acc[source.key] = [
        ...(staticOptions[source.key] ?? []),
        ...(remoteOptions[source.key] ?? []),
      ];

      return acc;
    }, {});
  }, [remoteOptions, sourceSnapshots, staticOptions]);

  return {
    options,
    isLoading,
  };
};
