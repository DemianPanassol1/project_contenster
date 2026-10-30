import type { FileType } from '../../../domain/media/file-type.enum.js';
import type { StorageProvider } from '../../../domain/media/storage-provider.enum.js';

export interface SystemAdminFileListItem {
  clientId: number | null;
  clientName: string | null;
  createdAt: string;
  fileType: FileType;
  id: number;
  mimeType: string;
  originalName: string;
  provider: StorageProvider;
  sizeInBytes: number;
  uploadedByName: string | null;
  url: string | null;
}
