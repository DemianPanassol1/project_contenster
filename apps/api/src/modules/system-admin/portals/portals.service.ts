import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import {
  isPortalAssetCompatible,
  type PaginatedBody,
  type PortalDetail,
  type PortalListItem,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalLoginMediaType,
  type PortalMediaFile,
  type PortalPalette,
} from '@contenster/shared';
import type { I18nTranslations } from '@/i18n/translations';
import { Language } from '@/modules/communication/languages/entities/language.entity';
import { File } from '@/modules/media/files/entities/file.entity';
import { FileService } from '@/modules/media/files/file.service';
import type { UploadedMultipartFile } from '@/modules/media/files/types/uploaded-multipart-file.type';
import {
  type DeleteRecordsRequestDto,
  normalizeDeleteRecordIds,
  type PaginateRequestDto,
} from '@/shared/dtos';
import { buildPaginationMeta } from '@/shared/pagination';

import { SavePortalRequestDto } from './dto/req/save-portal.request.dto';
import { Portal, PortalDomain, PortalLoginMedia, PortalTranslation } from './entities';
import { PortalsRepository } from './portals.repository';
import { type PortalMediaUploadResult } from './types';

const TRANSLATION_FIELDS = [
  'applicationName',
  'applicationDescription',
  'loginTitle',
  'loginDescription',
  'loginBrandAssetAlt',
  'supportText',
] as const;

@Injectable()
export class PortalsService {
  constructor(
    private readonly fileService: FileService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly repository: PortalsRepository,
  ) {}

  async list(request: PaginateRequestDto): Promise<PaginatedBody<PortalListItem>> {
    const [portals, total] = await this.repository.list(request);

    return {
      items: portals.map((portal) => ({
        hosts: portal.domains.map((domain) => domain.host).sort(),
        id: portal.id,
        internalName: portal.internalName,
        updatedAt: portal.updatedAt.toISOString(),
      })),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getById(id: number): Promise<PortalDetail> {
    return this.toDetail(await this.getEntityOrFail(id));
  }

  async save(request: SavePortalRequestDto): Promise<PortalDetail> {
    const portal = request.id === null ? new Portal() : await this.getEntityOrFail(request.id);
    const hosts = this.normalizeHosts(request.hosts);
    const conflictingDomains = await this.repository.findConflictingDomains(hosts, request.id);

    if (conflictingDomains.length > 0) {
      throw new ConflictException(this.i18n.t('errors.portal.domain_conflict'));
    }

    const translations = await this.buildTranslations(request);
    const filesById = await this.loadGlobalFiles(request);

    this.validateRequest(request, filesById);
    this.assignPortal(portal, request, filesById);

    const savedId = await this.repository.saveAggregate(
      portal,
      hosts.map((host) => Object.assign(new PortalDomain(), { host })),
      translations,
      request.loginMedia.map((item) =>
        Object.assign(new PortalLoginMedia(), {
          file: filesById.get(item.fileId)!,
          mediaType: item.mediaType,
          posterFile: item.posterFileId === null ? null : filesById.get(item.posterFileId)!,
          slot: item.slot,
        }),
      ),
    );

    return this.getById(savedId);
  }

  async delete(request: DeleteRecordsRequestDto): Promise<{ ids: number[] }> {
    const ids = normalizeDeleteRecordIds(request, this.i18n.t('validation.invalid_delete_request'));
    const portals = await this.repository.findByIds(ids);

    if (portals.length !== ids.length) {
      throw new NotFoundException(this.i18n.t('errors.portal.not_found'));
    }

    return { ids: await this.repository.delete(portals) };
  }

  async uploadMedia(
    file: UploadedMultipartFile | undefined,
    uploadedByUserId: number,
  ): Promise<PortalMediaUploadResult> {
    const uploadedFile = await this.fileService.uploadGlobal(file, uploadedByUserId);
    const portalMediaFile = this.toMediaFile(uploadedFile);

    if (!portalMediaFile) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_file'));
    }

    return { file: portalMediaFile };
  }

  private async getEntityOrFail(id: number): Promise<Portal> {
    const portal = await this.repository.findById(id);

    if (!portal) {
      throw new NotFoundException(this.i18n.t('errors.portal.not_found'));
    }

    return portal;
  }

  private normalizeHosts(hosts: string[]): string[] {
    const normalized = hosts.map((host) => host.trim().toLowerCase().replace(/\.$/, ''));

    if (
      normalized.some(
        (host) =>
          !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(host),
      )
    ) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_host'));
    }

    if (new Set(normalized).size !== normalized.length) {
      throw new BadRequestException(this.i18n.t('errors.portal.duplicate_host'));
    }

    return normalized;
  }

  private async buildTranslations(request: SavePortalRequestDto): Promise<PortalTranslation[]> {
    const locales = request.translations.map((translation) => translation.locale.toLowerCase());

    if (new Set(locales).size !== locales.length) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_translation'));
    }

    if (
      request.translations.some((translation) =>
        TRANSLATION_FIELDS.every((field) => translation[field] === null),
      )
    ) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_translation'));
    }

    const languages = await this.repository.findLanguagesByCodes(locales);

    if (languages.length !== locales.length) {
      throw new BadRequestException(this.i18n.t('errors.translations.language_not_found'));
    }

    const languagesByCode = new Map(languages.map((language) => [language.languageCode, language]));

    return request.translations.map((translation) =>
      Object.assign(new PortalTranslation(), {
        ...translation,
        language: languagesByCode.get(translation.locale.toLowerCase()) as Language,
      }),
    );
  }

  private async loadGlobalFiles(request: SavePortalRequestDto): Promise<Map<number, File>> {
    const ids = [
      request.faviconFileId,
      request.headerIconFileId,
      request.brandAssetFileId,
      ...request.loginMedia.flatMap((item) => [item.fileId, item.posterFileId]),
    ].filter((id): id is number => id !== null);
    const uniqueIds = [...new Set(ids)];
    const files = await this.repository.findGlobalFilesByIds(uniqueIds);

    if (files.length !== uniqueIds.length) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_file'));
    }

    return new Map(files.map((file) => [file.id, file]));
  }

  private validateRequest(request: SavePortalRequestDto, filesById: Map<number, File>): void {
    if (
      request.loginHeaderMode === PortalLoginHeaderMode.brandAsset &&
      (request.brandAssetFileId === null || request.headerIconFileId !== null)
    ) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_header'));
    }

    if (
      request.loginHeaderMode === PortalLoginHeaderMode.text &&
      request.brandAssetFileId !== null
    ) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_header'));
    }

    if (
      (request.loginLayout === PortalLoginLayout.split && request.splitMediaPosition === null) ||
      (request.loginLayout === PortalLoginLayout.centered && request.splitMediaPosition !== null)
    ) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_layout'));
    }

    if (new Set(request.loginMedia.map((media) => media.slot)).size !== request.loginMedia.length) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_media'));
    }

    this.assertFileRole(request.faviconFileId, filesById, 'favicon');
    this.assertFileRole(request.headerIconFileId, filesById, 'icon');
    this.assertFileRole(request.brandAssetFileId, filesById, 'brand');

    for (const media of request.loginMedia) {
      this.assertFileRole(
        media.fileId,
        filesById,
        media.mediaType === PortalLoginMediaType.video ? 'video' : 'image',
      );

      if (media.mediaType === PortalLoginMediaType.image && media.posterFileId !== null) {
        throw new BadRequestException(this.i18n.t('errors.portal.invalid_media'));
      }

      this.assertFileRole(media.posterFileId, filesById, 'image');
    }
  }

  private assertFileRole(
    fileId: number | null,
    filesById: Map<number, File>,
    role: 'favicon' | 'icon' | 'brand' | 'image' | 'video',
  ): void {
    if (fileId === null) return;

    const file = filesById.get(fileId);

    if (!file || !isPortalAssetCompatible(role, file.mimeType, file.fileType)) {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_file'));
    }
  }

  private assignPortal(
    portal: Portal,
    request: SavePortalRequestDto,
    filesById: Map<number, File>,
  ): void {
    portal.internalName = request.internalName;
    portal.fontScale = request.fontScale;
    portal.supportUrl = this.normalizeSupportUrl(request.supportUrl);
    portal.loginHeaderMode = request.loginHeaderMode;
    portal.loginLayout = request.loginLayout;
    portal.splitMediaPosition = request.splitMediaPosition;
    portal.faviconFile =
      request.faviconFileId === null ? null : filesById.get(request.faviconFileId)!;
    portal.headerIconFile =
      request.headerIconFileId === null ? null : filesById.get(request.headerIconFileId)!;
    portal.brandAssetFile =
      request.brandAssetFileId === null ? null : filesById.get(request.brandAssetFileId)!;

    this.assignPalette(portal, 'light', request.lightPalette);
    this.assignPalette(portal, 'dark', request.darkPalette);
  }

  private normalizeSupportUrl(value: string | null): string | null {
    if (value === null) return null;

    try {
      const url = new URL(value);

      if (url.protocol !== 'https:' || url.username || url.password) {
        throw new Error('Invalid support URL.');
      }

      return url.toString();
    } catch {
      throw new BadRequestException(this.i18n.t('errors.portal.invalid_support_url'));
    }
  }

  private assignPalette(portal: Portal, mode: 'light' | 'dark', palette: PortalPalette): void {
    portal[`${mode}Primary`] = palette.primary.toUpperCase();
    portal[`${mode}Secondary`] = palette.secondary.toUpperCase();
    portal[`${mode}Background`] = palette.background.toUpperCase();
    portal[`${mode}Paper`] = palette.paper.toUpperCase();
    portal[`${mode}Success`] = palette.success.toUpperCase();
    portal[`${mode}Warning`] = palette.warning.toUpperCase();
    portal[`${mode}Error`] = palette.error.toUpperCase();
  }

  private toDetail(portal: Portal): PortalDetail {
    return {
      brandAssetFile: this.toMediaFile(portal.brandAssetFile),
      brandAssetFileId: portal.brandAssetFile?.id ?? null,
      darkPalette: this.toPalette(portal, 'dark'),
      faviconFile: this.toMediaFile(portal.faviconFile),
      faviconFileId: portal.faviconFile?.id ?? null,
      fontScale: portal.fontScale,
      headerIconFile: this.toMediaFile(portal.headerIconFile),
      headerIconFileId: portal.headerIconFile?.id ?? null,
      hosts: portal.domains.map((domain) => domain.host).sort(),
      id: portal.id,
      internalName: portal.internalName,
      lightPalette: this.toPalette(portal, 'light'),
      loginHeaderMode: portal.loginHeaderMode,
      loginLayout: portal.loginLayout,
      loginMedia: portal.loginMedia.map((media) => ({
        file: this.toMediaFile(media.file)!,
        fileId: media.file.id,
        id: media.id,
        mediaType: media.mediaType,
        posterFile: this.toMediaFile(media.posterFile),
        posterFileId: media.posterFile?.id ?? null,
        slot: media.slot,
      })),
      splitMediaPosition: portal.splitMediaPosition,
      supportUrl: portal.supportUrl,
      translations: portal.translations.map((translation) => ({
        applicationDescription: translation.applicationDescription,
        applicationName: translation.applicationName,
        locale: translation.language.languageCode,
        loginBrandAssetAlt: translation.loginBrandAssetAlt,
        loginDescription: translation.loginDescription,
        loginTitle: translation.loginTitle,
        supportText: translation.supportText,
      })),
      updatedAt: portal.updatedAt.toISOString(),
    };
  }

  private toMediaFile(file: File | null): PortalMediaFile | null {
    if (!file || !file.publicUrl) return null;

    return {
      fileType: file.fileType,
      id: file.id,
      mimeType: file.mimeType,
      url: file.publicUrl,
    };
  }

  private toPalette(portal: Portal, mode: 'light' | 'dark'): PortalPalette {
    return {
      background: portal[`${mode}Background`],
      error: portal[`${mode}Error`],
      paper: portal[`${mode}Paper`],
      primary: portal[`${mode}Primary`],
      secondary: portal[`${mode}Secondary`],
      success: portal[`${mode}Success`],
      warning: portal[`${mode}Warning`],
    };
  }
}
