'use server';

import { apiInstance } from '@/services/api-instance.service';
import type { FetchOptions, HttpMethod, WebResponse } from '@/services/types';

export interface ApiRequestActionInput {
  body?: FetchOptions['body'];
  endpoint: string;
  method: HttpMethod;
}

export type ApiRequestActionResponse<TBody> = Omit<WebResponse<TBody>, 'responseCookies'>;

const toActionResponse = <TBody>(response: WebResponse<TBody>): ApiRequestActionResponse<TBody> => {
  const { responseCookies: _responseCookies, ...actionResponse } = response;

  return actionResponse;
};

export async function requestApi<TBody = Record<string, unknown>>(
  input: ApiRequestActionInput,
): Promise<ApiRequestActionResponse<TBody>> {
  const options: FetchOptions = {
    ...(input.body !== undefined && { body: input.body }),
  };
  let response: WebResponse<TBody>;

  switch (input.method) {
    case 'DELETE':
      response = await apiInstance.delete<TBody>(input.endpoint, options);
      break;

    case 'PATCH':
      response = await apiInstance.patch<TBody>(input.endpoint, options);
      break;

    case 'POST':
      response = await apiInstance.post<TBody>(input.endpoint, options);
      break;

    case 'PUT':
      response = await apiInstance.put<TBody>(input.endpoint, options);
      break;

    case 'GET':
      response = await apiInstance.get<TBody>(input.endpoint, options);
      break;
  }

  return toActionResponse(response);
}
