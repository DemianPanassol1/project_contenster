import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import sharp from 'sharp';

import { FileType, type StorageProvider } from '@contenster/shared';
import { settings } from '@/infrastructure/config/app.config';
import { Client } from '@/modules/identity/clients/entities/client.entity';
import { User } from '@/modules/identity/users/entities/user.entity';
import { StorageService } from '@/modules/media/storage/storage.service';
import { generateStoredFileName } from '@/modules/media/storage/utils/storage-path.util';

import { File } from './entities/file.entity';
import { StorageProviderConfiguration } from './entities/storage-provider-configuration.entity';
import { type ValidatedFile, validateUploadedFile } from './helpers/file-validation.helper';
import type { UploadedMultipartFile } from './types/uploaded-multipart-file.type';
import { FilesRepository } from './files.repository';
import { InvalidSvgContentError, SvgSanitizerService } from './svg-sanitizer.service';

export interface StoredFileResponse {
  extension: string | null;
  fileName: string;
  id: number;
  mimeType: string;
  originalName: string;
  provider: StorageProvider;
  size: number;
  type: FileType;
  url: string | null;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly i18n: I18nService,
    private readonly storageService: StorageService,
    private readonly svgSanitizer: SvgSanitizerService,
  ) {}

  async findById(id: number, clientId: number): Promise<File> {
    const file = await this.filesRepository.findById(id, clientId);
    if (!file) throw new NotFoundException(this.i18n.t('errors.file_not_found'));

    return file;
  }

  async upload(
    file: UploadedMultipartFile | undefined,
    clientId: number,
    uploadedByUserId: number,
  ): Promise<StoredFileResponse> {
    const validation = validateUploadedFile(file, settings.MAX_UPLOAD_FILE_SIZE_BYTES);
    if (!validation.ok) throw new BadRequestException(this.i18n.t(`errors.${validation.code}`));

    const rule = await this.filesRepository.findActiveStorageFileTypeRule(
      clientId,
      validation.file.fileType,
    );
    if (!rule?.storageConfiguration) {
      throw new BadRequestException(this.i18n.t('errors.storage_rule_not_found'));
    }

    const client = new Client();
    client.id = clientId;
    const uploadedBy = new User();
    uploadedBy.id = uploadedByUserId;
    const stored = await this.store(validation.file, client, uploadedBy, rule.storageConfiguration);

    return {
      extension: stored.extension,
      fileName: stored.storedName,
      id: stored.id,
      mimeType: stored.mimeType,
      originalName: stored.originalName,
      provider: stored.storageProvider,
      size: stored.sizeInBytes,
      type: stored.fileType,
      url: stored.publicUrl ?? stored.filePath,
    };
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
      return await this.filesRepository.save({
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

  private prepareForStorage(file: ValidatedFile): ValidatedFile {
    if (file.mimeType !== 'image/svg+xml') return file;

    try {
      const buffer = this.svgSanitizer.sanitize(file.buffer);
      return { ...file, buffer, size: buffer.length };
    } catch (error) {
      if (error instanceof InvalidSvgContentError) {
        throw new BadRequestException(this.i18n.t('errors.invalid_svg_content'));
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
      throw new BadRequestException(this.i18n.t('errors.invalid_file_type'));
    }
  }
}
