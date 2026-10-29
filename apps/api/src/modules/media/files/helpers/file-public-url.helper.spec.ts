import { describe, expect, it } from 'vitest';

import { StorageProvider } from '@contenster/shared';

import type { File } from '../entities/file.entity';

import { resolveFilePublicUrl } from './file-public-url.helper';

describe('resolveFilePublicUrl', () => {
  it('builds an absolute URL for local storage files', () => {
    expect(
      resolveFilePublicUrl({
        filePath: '/uploads/core/image/example.png',
        publicUrl: '/uploads/core/image/example.png',
        storageProvider: StorageProvider.local,
      } as File),
    ).toBe('http://localhost:5000/uploads/core/image/example.png');
  });

  it('preserves the configured public URL for external storage providers', () => {
    expect(
      resolveFilePublicUrl({
        filePath: 'core/image/example.png',
        publicUrl: 'https://cdn.example.test/core/image/example.png',
        storageProvider: StorageProvider.cloudflareR2,
      } as File),
    ).toBe('https://cdn.example.test/core/image/example.png');
  });
});
