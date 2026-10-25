import { type ReactNode } from 'react';

import type { HttpMethod } from '@/services/types';

export type Theme = 'light' | 'dark';
export type DrawerState = 'open' | 'close';

export interface GlobalState {
  isLoading: boolean;
  theme: Theme;
  drawerState: DrawerState;
}

export interface GlobalProviderProps {
  children: ReactNode;
}

export interface GlobalContextData {
  state: GlobalState;
  toggleDrawer: (drawerState?: DrawerState) => void;
  toggleLoading: (isLoading?: boolean) => void;
  toggleTheme: (theme?: Theme) => void;
  apiRequest: <T>(params: Partial<ApiRequest<T>>) => Promise<void>;
}

export interface ApiRequest<T = unknown> {
  method: HttpMethod;
  endpoint: string;
  body: object | FormData;
  onSuccess: (data?: T | null) => Promise<void> | void;
  onError: (data?: T | null) => Promise<void> | void;
  showDefaultSuccessMessage: boolean;
  showDefaultErrorMessage: boolean;
  successMessage: string;
  errorMessage: string;
  shouldRefreshPage: boolean;
  shouldSyncSession: boolean;
}
