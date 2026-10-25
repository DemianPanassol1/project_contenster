import type { ApiRequestActionResponse } from './api-request.action';

export const createRequestInProgressResponse = <TBody>(): ApiRequestActionResponse<TBody> => ({
  body: null,
  errors: [
    {
      code: 'request_in_progress',
      errorType: 'RequestInProgress',
      id: crypto.randomUUID(),
      message: 'A request is already in progress.',
    },
  ],
  statusCode: 409,
  success: false,
});

export const createUnexpectedErrorResponse = <TBody>(
  error: unknown,
): ApiRequestActionResponse<TBody> => ({
  body: null,
  errors: [
    {
      code: 'unexpected_request_error',
      errorType: 'UnexpectedRequestError',
      id: crypto.randomUUID(),
      message: error instanceof Error ? error.message : 'Unknown error.',
    },
  ],
  statusCode: 0,
  success: false,
});
