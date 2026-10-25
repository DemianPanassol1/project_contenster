import type { ApiRequestActionResponse } from '@/services/actions';
import type { UploadFieldFile } from '@/types';

type ApiRequest = <TBody>(request: {
  body?: FormData;
  endpoint: string;
  method: 'POST';
}) => Promise<ApiRequestActionResponse<TBody>>;

export const getMediaFileEndpoint = (id: number): string => `files/${id}`;

export const uploadMediaFile = async (
  apiRequest: ApiRequest,
  file: File,
  endpoint = 'files',
): Promise<UploadFieldFile | null> => {
  const body = new FormData();
  body.append('file', file);

  const response = await apiRequest<UploadFieldFile>({ body, endpoint, method: 'POST' });

  return response.success ? response.body : null;
};
