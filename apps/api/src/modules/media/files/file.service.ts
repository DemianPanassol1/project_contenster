import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import sharp from 'sharp';

import { type FileResponse, FileType, PORTAL_UPLOAD_MIME_TYPES } from '@contenster/shared';
import type { I18nPath, I18nTranslations } from '@/i18n/translations';
import { settings } from '@/infrastructure/config/app.config';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { StorageService } from '@/modules/media/storage/storage.service';
import { generateStoredFileName } from '@/modules/media/storage/utils/storage-path.util';
import { toResponseDto } from '@/shared/responses';

import { FileResponseDto } from './dto/res/file.response.dto';
import { File } from './entities/file.entity';
import { StorageProviderConfiguration } from './entities/storage-provider-configuration.entity';
import { resolveFilePublicUrl } from './helpers/file-public-url.helper';
import {
  type FileValidationErrorCode,
  type ValidatedFile,
  validateUploadedFile,
} from './helpers/file-validation.helper';
import type { UploadedMultipartFile } from './types/uploaded-multipart-file.type';
import { FileRepository } from './file.repository';
import { InvalidSvgContentError, SvgSanitizerService } from './svg-sanitizer.service';

const fileValidationErrorKeys = {
  file_required: 'errors.media.file_required',
  file_too_large: 'errors.media.file_too_large',
  invalid_file_type: 'errors.media.invalid_file_type',
} as const satisfies Record<FileValidationErrorCode, I18nPath>;

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly storageService: StorageService,
    private readonly svgSanitizer: SvgSanitizerService,
  ) {}

  async findById(id: number, clientId: number): Promise<FileResponseDto> {
    const file = await this.fileRepository.findById(id, clientId);
    if (!file) throw new NotFoundException(this.i18n.t('errors.media.file_not_found'));

    return this.toResponse(file);
  }

  async upload(
    file: UploadedMultipartFile | undefined,
    clientId: number,
    uploadedByUserId: number,
  ): Promise<FileResponseDto> {
    const validation = validateUploadedFile(file, settings.MAX_UPLOAD_FILE_SIZE_BYTES);
    if (!validation.ok) {
      throw new BadRequestException(this.i18n.t(fileValidationErrorKeys[validation.code]));
    }

    const rule = await this.fileRepository.findActiveStorageFileTypeRule(
      clientId,
      validation.file.fileType,
    );
    if (!rule?.storageConfiguration) {
      throw new BadRequestException(this.i18n.t('errors.storage.rule_not_found'));
    }

    const client = new Client();
    client.id = clientId;
    const uploadedBy = new User();
    uploadedBy.id = uploadedByUserId;
    const stored = await this.store(validation.file, client, uploadedBy, rule.storageConfiguration);

    return this.toResponse(stored);
  }

  async uploadGlobal(
    file: UploadedMultipartFile | undefined,
    uploadedByUserId: number,
  ): Promise<File> {
    const validation = validateUploadedFile(file, settings.MAX_UPLOAD_FILE_SIZE_BYTES);

    if (!validation.ok) {
      throw new BadRequestException(this.i18n.t(fileValidationErrorKeys[validation.code]));
    }

    if (!PORTAL_UPLOAD_MIME_TYPES.includes(validation.file.mimeType)) {
      throw new BadRequestException(this.i18n.t('errors.media.invalid_file_type'));
    }

    const uploadedBy = new User();
    uploadedBy.id = uploadedByUserId;

    return this.storeDefaultLocal(validation.file, uploadedBy);
  }

  private async store(
    file: ValidatedFile,
    client: Client,
    uploadedBy: User,
    storageConfiguration: StorageProviderConfiguration,
  ): Promise<File> {
    const prepared = this.prepareForStorage(file);
    const metadata = await this.getImageMetadata(prepared.fileType, prepared.buffer);
    const storedName = generateStoredFileName(prepared.originalName, prepared.mimeType);
    const storedFile = await this.storageService.upload({
      buffer: prepared.buffer,
      fileType: prepared.fileType,
      mimeType: prepared.mimeType,
      originalName: prepared.originalName,
      sizeInBytes: prepared.size,
      storageConfiguration,
      storedName,
    });

    try {
      return await this.fileRepository.save({
        client,
        extension: prepared.extension,
        filePath: storedFile.filePath,
        fileType: prepared.fileType,
        height: metadata.height,
        mimeType: prepared.mimeType,
        originalName: prepared.originalName,
        publicUrl: storedFile.publicUrl,
        sizeInBytes: prepared.size,
        storageConfiguration,
        storageKey: storedFile.storageKey,
        storageProvider: storedFile.storageProvider,
        storedName,
        uploadedBy,
        width: metadata.width,
      });
    } catch (error) {
      try {
        await this.storageService.delete({
          filePath: storedFile.filePath,
          storageConfiguration,
          storageKey: storedFile.storageKey,
          storageProvider: storedFile.storageProvider,
        });
      } catch (cleanupError) {
        this.logger.error(
          'Failed to remove the stored object after persistence failure.',
          cleanupError,
        );
      }

      throw error;
    }
  }

  private async storeDefaultLocal(file: ValidatedFile, uploadedBy: User): Promise<File> {
    const prepared = this.prepareForStorage(file);
    const metadata = await this.getImageMetadata(prepared.fileType, prepared.buffer);
    const storedName = generateStoredFileName(prepared.originalName, prepared.mimeType);
    const storedFile = await this.storageService.uploadDefaultLocal({
      buffer: prepared.buffer,
      fileType: prepared.fileType,
      mimeType: prepared.mimeType,
      originalName: prepared.originalName,
      sizeInBytes: prepared.size,
      storedName,
    });

    try {
      return await this.fileRepository.save({
        client: null,
        extension: prepared.extension,
        filePath: storedFile.filePath,
        fileType: prepared.fileType,
        height: metadata.height,
        mimeType: prepared.mimeType,
        originalName: prepared.originalName,
        publicUrl: storedFile.publicUrl,
        sizeInBytes: prepared.size,
        storageConfiguration: null,
        storageKey: storedFile.storageKey,
        storageProvider: storedFile.storageProvider,
        storedName,
        uploadedBy,
        width: metadata.width,
      });
    } catch (error) {
      await this.storageService.delete({
        filePath: storedFile.filePath,
        storageProvider: storedFile.storageProvider,
        storageKey: storedFile.storageKey,
      });

      throw error;
    }
  }

  private prepareForStorage(file: ValidatedFile): ValidatedFile {
    if (file.mimeType !== 'image/svg+xml') return file;

    try {
      const buffer = this.svgSanitizer.sanitize(file.buffer);
      return { ...file, buffer, size: buffer.length };
    } catch (error) {
      if (error instanceof InvalidSvgContentError) {
        throw new BadRequestException(this.i18n.t('errors.media.invalid_svg_content'));
      }

      throw error;
    }
  }

  private async getImageMetadata(
    fileType: FileType,
    buffer: Buffer,
  ): Promise<{ height: number | null; width: number | null }> {
    if (fileType !== FileType.image) return { height: null, width: null };

    try {
      const metadata = await sharp(buffer).metadata();
      return { height: metadata.height ?? null, width: metadata.width ?? null };
    } catch {
      throw new BadRequestException(this.i18n.t('errors.media.invalid_file_type'));
    }
  }

  private toResponse(file: File): FileResponseDto {
    const response: FileResponse = {
      clientId: file.client?.id ?? null,
      createdAt: file.createdAt.toISOString(),
      extension: file.extension,
      fileName: file.storedName,
      height: file.height,
      id: file.id,
      mimeType: file.mimeType,
      originalName: file.originalName,
      provider: file.storageProvider,
      size: file.sizeInBytes,
      type: file.fileType,
      uploadedByUserId: file.uploadedBy?.id ?? null,
      url: resolveFilePublicUrl(file) ?? file.filePath,
      width: file.width,
    };

    return toResponseDto(FileResponseDto, response);
  }
}
