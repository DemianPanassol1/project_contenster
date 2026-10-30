import { FileType } from '../media/file-type.enum.js';
import { ICO_MIME_TYPES, SVG_MIME_TYPE } from '../media/media-mime-types.const.js';

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
const faviconMimeTypes = new Set(['image/png', SVG_MIME_TYPE, ...ICO_MIME_TYPES]);

export const isPortalAssetCompatible = (
  role: PortalAssetRole,
  mimeType: string,
  fileType: FileType,
): boolean => {
  switch (role) {
    case 'favicon':
      if (!faviconMimeTypes.has(mimeType)) return false;

      if (mimeType === 'image/png') return fileType === FileType.image;

      return fileType === FileType.icon;
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
