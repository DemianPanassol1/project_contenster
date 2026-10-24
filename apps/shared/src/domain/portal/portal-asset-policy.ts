import { FileType } from '../media/file-type.enum.js';

export type PortalAssetRole = 'favicon' | 'icon' | 'brand' | 'image' | 'video';

const imageMimeTypes = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);
const iconMimeTypes = new Set(['image/svg+xml', 'image/vnd.microsoft.icon', 'image/x-icon']);
const videoMimeTypes = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

export const isPortalAssetCompatible = (
  role: PortalAssetRole,
  mimeType: string,
  fileType: FileType,
): boolean => {
  switch (role) {
    case 'favicon':
    case 'icon':
      return fileType === FileType.icon && iconMimeTypes.has(mimeType);
    case 'brand':
    case 'image':
      return fileType === FileType.image && imageMimeTypes.has(mimeType);
    case 'video':
      return fileType === FileType.video && videoMimeTypes.has(mimeType);
  }
};

export const PORTAL_UPLOAD_MIME_TYPES = [
  ...new Set([...imageMimeTypes, ...iconMimeTypes, ...videoMimeTypes]),
];
