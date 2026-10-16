import { FileType, ICO_MIME_TYPES, SVG_MIME_TYPE } from '@contenster/shared';
import { getFileExtension } from '@/modules/media/storage/utils/storage-path.util';

import type { UploadedMultipartFile } from '../types/uploaded-multipart-file.type';

export type FileValidationErrorCode = 'file_required' | 'file_too_large' | 'invalid_file_type';

export interface ValidatedFile {
  buffer: Buffer;
  extension: string | null;
  fileType: FileType;
  mimeType: string;
  originalName: string;
  size: number;
}

export type FileValidationResult =
  { file: ValidatedFile; ok: true } | { code: FileValidationErrorCode; ok: false };

const ALLOWED_EXTENSIONS_BY_MIME: Record<string, readonly string[]> = {
  'application/json': ['json'],
  'application/pdf': ['pdf'],
  'image/gif': ['gif'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/vnd.microsoft.icon': ['ico'],
  'image/webp': ['webp'],
  'image/x-icon': ['ico'],
  [SVG_MIME_TYPE]: ['svg'],
  'text/csv': ['csv'],
  'text/plain': ['txt'],
  'video/mp4': ['mp4'],
  'video/quicktime': ['mov'],
  'video/webm': ['webm'],
};

const IMAGE_MIME_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  SVG_MIME_TYPE,
  'image/webp',
]);
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
const ICON_MIME_TYPES = new Set<string>([SVG_MIME_TYPE, ...ICO_MIME_TYPES]);

const startsWithBytes = (buffer: Buffer, bytes: readonly number[]): boolean =>
  bytes.every((byte, index) => buffer[index] === byte);

const hasValidIcoStructure = (buffer: Buffer): boolean => {
  if (buffer.length < 22 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    return false;
  }

  const imageCount = buffer.readUInt16LE(4);
  const directoryEnd = 6 + imageCount * 16;

  if (imageCount === 0 || directoryEnd > buffer.length) {
    return false;
  }

  for (let index = 0; index < imageCount; index += 1) {
    const entryOffset = 6 + index * 16;
    const imageSize = buffer.readUInt32LE(entryOffset + 8);
    const imageOffset = buffer.readUInt32LE(entryOffset + 12);
    const imageEnd = imageOffset + imageSize;

    if (
      buffer[entryOffset + 3] !== 0 ||
      imageSize === 0 ||
      imageOffset < directoryEnd ||
      imageEnd > buffer.length ||
      imageEnd < imageOffset
    ) {
      return false;
    }

    const imageBuffer = buffer.subarray(imageOffset, imageEnd);
    const isPng = startsWithBytes(imageBuffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const dibHeaderSize = imageBuffer.length >= 4 ? imageBuffer.readUInt32LE(0) : 0;
    const isDib =
      dibHeaderSize >= 12 && dibHeaderSize <= 124 && dibHeaderSize <= imageBuffer.length;

    if (!isPng && !isDib) {
      return false;
    }
  }

  return true;
};

const includesAscii = (buffer: Buffer, value: string, maxBytes = 512): boolean =>
  buffer.subarray(0, maxBytes).toString('ascii').includes(value);

const looksLikeText = (buffer: Buffer): boolean => {
  const sample = buffer.subarray(0, 1024);

  return !sample.includes(0);
};

const hasValidSignature = (mimeType: string, buffer: Buffer): boolean => {
  if (buffer.length === 0) {
    return false;
  }

  switch (mimeType) {
    case 'application/json':
    case 'text/csv':
    case 'text/plain':
      return looksLikeText(buffer);
    case 'application/pdf':
      return startsWithBytes(buffer, [0x25, 0x50, 0x44, 0x46]);
    case 'image/gif':
      return includesAscii(buffer, 'GIF87a', 6) || includesAscii(buffer, 'GIF89a', 6);
    case 'image/vnd.microsoft.icon':
    case 'image/x-icon':
      return hasValidIcoStructure(buffer);
    case 'image/jpeg':
      return startsWithBytes(buffer, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case SVG_MIME_TYPE:
      return looksLikeText(buffer);
    case 'image/webp':
      return includesAscii(buffer, 'RIFF', 4) && includesAscii(buffer.subarray(8), 'WEBP', 4);
    case 'video/mp4':
    case 'video/quicktime':
      return includesAscii(buffer, 'ftyp', 16);
    case 'video/webm':
      return startsWithBytes(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
    default:
      return false;
  }
};

const getFileType = (mimeType: string): FileType => {
  if (ICON_MIME_TYPES.has(mimeType)) {
    return FileType.icon;
  }

  if (IMAGE_MIME_TYPES.has(mimeType)) {
    return FileType.image;
  }

  if (VIDEO_MIME_TYPES.has(mimeType)) {
    return FileType.video;
  }

  return FileType.file;
};

export const validateUploadedFile = (
  file: UploadedMultipartFile | undefined,
  maxSizeInBytes: number,
): FileValidationResult => {
  if (!file?.buffer) {
    return { ok: false, code: 'file_required' };
  }

  if (file.size > maxSizeInBytes) {
    return { ok: false, code: 'file_too_large' };
  }

  const mimeType = file.mimetype.toLowerCase();
  const extension = getFileExtension(file.originalname);
  const allowedExtensions = ALLOWED_EXTENSIONS_BY_MIME[mimeType];

  if (!allowedExtensions || !extension || !allowedExtensions.includes(extension)) {
    return { ok: false, code: 'invalid_file_type' };
  }

  if (!hasValidSignature(mimeType, file.buffer)) {
    return { ok: false, code: 'invalid_file_type' };
  }

  return {
    ok: true,
    file: {
      buffer: file.buffer,
      extension,
      fileType: getFileType(mimeType),
      mimeType,
      originalName: file.originalname,
      size: file.size,
    },
  };
};
