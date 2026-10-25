import type { FileResponse } from '@contenster/shared';

import type { ApiRequestActionResponse } from '@/services/actions';

type ApiRequest = <TBody>(request: {
  body?: FormData;
  endpoint: string;
  method: 'POST';
}) => Promise<ApiRequestActionResponse<TBody>>;

export type MediaFileEndpointResolver = (id: number) => string;

export const getMediaFileEndpoint: MediaFileEndpointResolver = (id) => `media/files/${id}`;

export const uploadMediaFile = async (
  apiRequest: ApiRequest,
  file: File,
  endpoint = 'media/files/upload',
): Promise<FileResponse | null> => {
  const body = new FormData();
  body.append('file', file);

  const response = await apiRequest<FileResponse>({ body, endpoint, method: 'POST' });

  return response.success ? response.body : null;
};
