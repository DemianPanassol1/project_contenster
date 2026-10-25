import type { ApiRequestActionResponse } from '@/services/actions';

export interface UseGetResponse<T> {
  data?: ApiRequestActionResponse<T>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export interface UsePostResponse<T> {
  data?: ApiRequestActionResponse<T>;
  isLoading: boolean;
  refresh: () => Promise<unknown>;
}
