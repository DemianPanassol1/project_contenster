import type { FileType } from '../../../domain/media/file-type.enum.js';
import type { StorageProvider } from '../../../domain/media/storage-provider.enum.js';

export interface FileResponse {
  clientId: number;
  createdAt: string;
  extension: string | null;
  fileName: string;
  height: number | null;
  id: number;
  mimeType: string;
  originalName: string;
  provider: StorageProvider;
  size: number;
  type: FileType;
  uploadedByUserId: number | null;
  url: string | null;
  width: number | null;
}

export type GetFileByIdResponse = FileResponse;

export type UploadFileResponse = FileResponse;
