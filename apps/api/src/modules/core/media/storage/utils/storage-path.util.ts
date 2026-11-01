import { randomBytes } from 'node:crypto';
import { basename, extname, resolve, sep } from 'node:path';

import { FileType, SVG_MIME_TYPE } from '@contenster/shared';
import { settings, WORKSPACE_ROOT_PATH } from '@/infrastructure/config/app.config';

const RESERVED_SEGMENTS = new Set(['.', '..']);
const STORAGE_IDENTIFIER_REGEX = /^[a-z0-9][a-z0-9-_]{2,62}$/;
const STORAGE_BUCKET_NAME_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
const CLOUDFLARE_R2_ACCOUNT_ID_REGEX = /^[a-f0-9]{32}$/;
const GOOGLE_CLOUD_PROJECT_ID_REGEX = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
const STORAGE_FILE_FOLDERS = new Set(['files', 'images', 'videos', 'icons']);
const RESERVED_STORAGE_IDENTIFIERS = new Set(['core', 'files', 'images', 'videos', 'icons']);
const DEFAULT_EXTENSION_BY_MIME: Record<string, string> = {
  'application/json': 'json',
  'application/pdf': 'pdf',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  [SVG_MIME_TYPE]: 'svg',
  'image/webp': 'webp',
  'text/csv': 'csv',
  'text/plain': 'txt',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

const assertSafeSegment = (segment: string): string => {
  const normalized = segment.trim();

  if (!normalized || RESERVED_SEGMENTS.has(normalized) || /[\\/]/.test(normalized)) {
    throw new Error('Invalid storage path segment.');
  }

  return normalized;
};

export const getStorageFileFolder = (fileType: FileType): string => {
  switch (fileType) {
    case FileType.icon:
      return 'icons';
    case FileType.image:
      return 'images';
    case FileType.video:
      return 'videos';
    default:
      return 'files';
  }
};

export const validateStorageIdentifier = (identifier: string): string => {
  const normalized = identifier.trim();

  if (!STORAGE_IDENTIFIER_REGEX.test(normalized) || RESERVED_STORAGE_IDENTIFIERS.has(normalized)) {
    throw new Error('Invalid storage identifier.');
  }

  return normalized;
};

export const buildStorageObjectKey = (
  identifier: string | null,
  fileType: FileType,
  storedName: string,
): string => {
  const root = identifier ? validateStorageIdentifier(identifier) : 'core';
  const fileName = assertSafeSegment(storedName);

  return [root, getStorageFileFolder(fileType), fileName].join('/');
};

export const isValidStorageObjectKey = (storageKey: string): boolean => {
  try {
    const [root, folder, fileName, ...rest] = storageKey.split('/');

    if (rest.length > 0 || !root || !folder || !fileName) return false;
    if (root !== 'core') validateStorageIdentifier(root);

    return (
      STORAGE_FILE_FOLDERS.has(assertSafeSegment(folder)) && Boolean(assertSafeSegment(fileName))
    );
  } catch {
    return false;
  }
};

export const getUploadsRootPath = (): string =>
  resolve(WORKSPACE_ROOT_PATH, settings.UPLOADS_LOCAL_ROOT_PATH);

export const resolveLocalStoragePath = (storageKey: string): string => {
  if (!isValidStorageObjectKey(storageKey)) throw new Error('Invalid local storage key.');

  const uploadsRoot = getUploadsRootPath();
  const target = resolve(uploadsRoot, ...storageKey.split('/'));
  const prefix = uploadsRoot.endsWith(sep) ? uploadsRoot : `${uploadsRoot}${sep}`;

  if (!target.startsWith(prefix)) throw new Error('Storage path is outside the uploads root.');

  return target;
};

export const buildPublicUploadPath = (storageKey: string): string => {
  const base = settings.UPLOADS_PUBLIC_BASE_URL.replace(/^\/+|\/+$/g, '');

  return `/${[base, storageKey].filter(Boolean).join('/')}`;
};

export const normalizeStorageKey = (value: string): string => {
  const base = settings.UPLOADS_PUBLIC_BASE_URL.replace(/^\/+|\/+$/g, '');
  const normalized = value.trim().replace(/\\/g, '/').replace(/^\/+/, '');

  return base && normalized.startsWith(`${base}/`) ? normalized.slice(base.length + 1) : normalized;
};

export const buildStoragePublicUrl = (baseUrl: string | null, storageKey: string): string | null =>
  baseUrl?.trim().replace(/\/+$/, '')
    ? `${baseUrl.trim().replace(/\/+$/, '')}/${storageKey}`
    : null;

export const isValidStoragePublicBaseUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

export const isValidCloudflareR2AccountId = (value: string): boolean =>
  CLOUDFLARE_R2_ACCOUNT_ID_REGEX.test(value);
export const isValidCloudflareR2BucketName = (value: string): boolean =>
  STORAGE_BUCKET_NAME_REGEX.test(value);
export const isValidGoogleCloudStorageBucketName = isValidCloudflareR2BucketName;
export const isValidGoogleCloudStorageProjectId = (value: string): boolean =>
  GOOGLE_CLOUD_PROJECT_ID_REGEX.test(value);

export const normalizeCloudflareR2Endpoint = (value: string): string | null => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      (host !== 'r2.cloudflarestorage.com' && !host.endsWith('.r2.cloudflarestorage.com')) ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
};

export const getFileExtension = (fileName: string): string | null => {
  const extension = extname(fileName).replace(/^\./, '').trim().toLowerCase();

  return extension || null;
};

export const generateStoredFileName = (originalName: string, mimeType: string): string => {
  const baseName =
    basename(originalName, extname(originalName))
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^\.+|\.+$/g, '')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90) || 'file';
  const extension = getFileExtension(originalName) ?? DEFAULT_EXTENSION_BY_MIME[mimeType];
  const name = `${baseName}-${Date.now()}-${randomBytes(8).toString('hex')}`;

  return extension ? `${name}.${extension}` : name;
};
