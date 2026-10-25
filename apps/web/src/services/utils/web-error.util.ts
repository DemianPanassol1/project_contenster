import type { ApiRequestActionResponse } from '@/services/actions';
import type { WebError } from '@/services/types';

interface WebErrorToastMessages {
  connectionError: string;
  defaultError: string;
  timeoutError: string;
}

export const getWebErrorToastMessage = (
  error: WebError,
  messages: WebErrorToastMessages,
): string => {
  if (error.errorType === 'TimeoutError') return messages.timeoutError;

  if (error.errorType === 'NetworkError') return messages.connectionError;

  return error.message || messages.defaultError;
};

export const getWebResponseErrorToastMessages = (
  response: Pick<ApiRequestActionResponse<unknown>, 'errors'>,
  messages: WebErrorToastMessages,
): string[] =>
  Array.from(new Set(response.errors.map((error) => getWebErrorToastMessage(error, messages))));
