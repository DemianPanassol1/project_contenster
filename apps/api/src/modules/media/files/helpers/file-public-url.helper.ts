import { StorageProvider } from '@contenster/shared';
import { settings } from '@/infrastructure/config/app.config';

import type { File } from '../entities/file.entity';

export const resolveFilePublicUrl = (file: File | null | undefined): string | null => {
  if (!file) {
    return null;
  }

  if (file.storageProvider !== StorageProvider.local) {
    return file.publicUrl;
  }

  const baseUrl = settings.APP_URL.replace(/\/+$/g, '');
  const filePath = file.filePath.startsWith('/') ? file.filePath : `/${file.filePath}`;

  return `${baseUrl}${filePath}`;
};
