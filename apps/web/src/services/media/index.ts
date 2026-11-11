import type { FileResponse } from '@contenster/shared';

import { API_ROUTES } from '@/routes';
import type { ApiRequestActionResponse } from '@/services/actions';

type ApiRequest = <TBody>(request: {
  body?: FormData;
  endpoint: string;
  method: 'POST';
}) => Promise<ApiRequestActionResponse<TBody>>;

export type MediaFileEndpointResolver = (id: number) => string;

export const getMediaFileEndpoint: MediaFileEndpointResolver = API_ROUTES.MEDIA.GET_FILE;

export const uploadMediaFile = async (
  apiRequest: ApiRequest,
  file: File,
  endpoint: string = API_ROUTES.MEDIA.POST_FILE_UPLOAD,
): Promise<FileResponse | null> => {
  const body = new FormData();
  body.append('file', file);

  const response = await apiRequest<FileResponse>({ body, endpoint, method: 'POST' });

  return response.success ? response.body : null;
};
