'use client';

import { useColorScheme } from '@mui/material/styles';
import { useLocale, useTranslations } from 'next-intl';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { useOptionalSessionRevalidation } from '@/core/session/AuthenticatedSessionRevalidator';
import { useToast, useWebResponseErrorToast } from '@/hooks';
import {
  type ApiRequestActionResponse,
  createRequestInProgressResponse,
  createUnexpectedErrorResponse,
  requestApi,
} from '@/services/actions';
import type { FetchOptions, HttpMethod } from '@/services/types';

export type AdminTheme = 'dark' | 'light' | 'system';
export type DrawerState = 'closed' | 'open';

export interface GlobalState {
  drawerState: DrawerState;
  isLoading: boolean;
  theme: AdminTheme;
}

export interface ApiRequestOptions<TBody = unknown> {
  body?: FetchOptions['body'];
  endpoint: string;
  errorMessage?: string | null;
  method: HttpMethod;
  onError?: (response: ApiRequestActionResponse<TBody>) => Promise<void> | void;
  onSuccess?: (response: ApiRequestActionResponse<TBody>) => Promise<void> | void;
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string | null;
}

export interface GlobalContextValue {
  apiRequest: <TBody = unknown>(
    options: ApiRequestOptions<TBody>,
  ) => Promise<ApiRequestActionResponse<TBody>>;
  state: GlobalState;
  toggleLoading: (isLoading: boolean) => void;
  toggleDrawer: (state?: DrawerState) => void;
  toggleTheme: (theme?: AdminTheme) => void;
}

const initialState: Omit<GlobalState, 'theme'> = {
  drawerState: 'open',
  isLoading: false,
};

const GlobalContext = createContext<GlobalContextValue | null>(null);

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const locale = useLocale();
  const t = useTranslations('protected.feedback');
  const { errorMessage, successMessage } = useToast();
  const showResponseErrors = useWebResponseErrorToast();
  const { mode, setMode, systemMode } = useColorScheme();
  const sessionRevalidation = useOptionalSessionRevalidation();

  const [state, setState] = useState<Omit<GlobalState, 'theme'>>(initialState);

  const toggleDrawer = useCallback((drawerState?: DrawerState) => {
    setState((current) => ({
      ...current,
      drawerState: drawerState ?? (current.drawerState === 'open' ? 'closed' : 'open'),
    }));
  }, []);

  const toggleLoading = useCallback((isLoading: boolean) => {
    setState((current) => ({ ...current, isLoading }));
  }, []);

  const toggleTheme = useCallback(
    (theme?: AdminTheme) => {
      if (theme) {
        setMode(theme);

        return;
      }

      const currentTheme = mode === 'dark' || mode === 'light' ? mode : (systemMode ?? 'light');

      setMode(currentTheme === 'light' ? 'dark' : 'light');
    },
    [mode, setMode, systemMode],
  );

  const apiRequest = useCallback(
    async <TBody,>(options: ApiRequestOptions<TBody>): Promise<ApiRequestActionResponse<TBody>> => {
      if (state.isLoading) {
        const response = createRequestInProgressResponse<TBody>();

        if (options.showErrorMessage !== false) {
          errorMessage(t('request_in_progress'));
        }

        await options.onError?.(response);

        return response;
      }

      setState((current) => ({ ...current, isLoading: true }));

      try {
        const response = await requestApi<TBody>({
          ...(options.body !== undefined && { body: options.body }),
          endpoint: options.endpoint,
          locale,
          method: options.method,
        });

        if (response.success) {
          if (options.method !== 'GET') {
            await sessionRevalidation?.requestSessionRevalidation();
          }

          if (options.showSuccessMessage !== false) {
            successMessage(options.successMessage ?? t('operation_succeeded'));
          }

          await options.onSuccess?.(response);
        } else {
          if (options.showErrorMessage !== false) {
            if (options.errorMessage) {
              errorMessage(options.errorMessage);
            } else {
              showResponseErrors(response);
            }
          }

          await options.onError?.(response);
        }

        return response;
      } catch (error: unknown) {
        const response = createUnexpectedErrorResponse<TBody>(error);

        if (options.showErrorMessage !== false) {
          if (options.errorMessage) {
            errorMessage(options.errorMessage);
          } else {
            showResponseErrors(response);
          }
        }

        await options.onError?.(response);

        return response;
      } finally {
        setState((current) => ({ ...current, isLoading: false }));
      }
    },
    [
      errorMessage,
      locale,
      sessionRevalidation,
      showResponseErrors,
      successMessage,
      t,
      state.isLoading,
    ],
  );

  const stateWithTheme = useMemo<GlobalState>(
    () => ({ ...state, theme: mode ?? 'system' }),
    [mode, state],
  );

  const value = useMemo(
    () => ({ apiRequest, state: stateWithTheme, toggleDrawer, toggleLoading, toggleTheme }),
    [apiRequest, stateWithTheme, toggleDrawer, toggleLoading, toggleTheme],
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobalContext(): GlobalContextValue {
  const context = useOptionalGlobalContext();

  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider.');
  }

  return context;
}

export function useOptionalGlobalContext(): GlobalContextValue | null {
  return useContext(GlobalContext);
}
