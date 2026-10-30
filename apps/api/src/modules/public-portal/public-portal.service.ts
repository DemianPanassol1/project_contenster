import { Injectable } from '@nestjs/common';

import {
  defaultPortalDarkPalette,
  defaultPortalLightPalette,
  isPortalAssetCompatible,
  normalizePortalHost,
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalLoginMediaType,
  type PortalMediaFile,
  type PortalPalette,
  type ResolvedPublicPortal,
} from '@contenster/shared';
import { File } from '@/modules/media/files/entities/file.entity';
import { resolveFilePublicUrl } from '@/modules/media/files/helpers/file-public-url.helper';
import { Portal } from '@/modules/system-admin/portals/entities/portal.entity';
import { PortalTranslation } from '@/modules/system-admin/portals/entities/portal-translation.entity';
import { getCurrentLocale } from '@/shared/i18n';

import { PublicPortalRepository } from './public-portal.repository';

type PortalTranslationTextField =
  | 'applicationDescription'
  | 'applicationName'
  | 'loginBrandAssetAlt'
  | 'loginDescription'
  | 'loginTitle'
  | 'supportText';

@Injectable()
export class PublicPortalService {
  constructor(private readonly repository: PublicPortalRepository) {}

  async resolve(rawHost: string | undefined): Promise<ResolvedPublicPortal> {
    const fallback = this.fallback();
    const host = normalizePortalHost(rawHost ?? '');

    if (!host) return fallback;

    const portal = await this.repository.findByHost(host);

    return portal ? this.toResolvedPortal(portal, getCurrentLocale(), fallback) : fallback;
  }

  private toResolvedPortal(
    portal: Portal,
    locale: string,
    fallback: ResolvedPublicPortal,
  ): ResolvedPublicPortal {
    const translation = this.findTranslation(portal.translations, locale);
    const portuguese = this.findTranslation(portal.translations, 'pt');
    const text = (field: PortalTranslationTextField): string | null =>
      translation?.[field] ?? portuguese?.[field] ?? null;
    const brandAsset = this.toMediaFile(portal.brandAssetFile, 'brand');
    const headerIcon = this.toMediaFile(portal.headerIconFile, 'icon');
    const headerMode =
      portal.loginHeaderMode === PortalLoginHeaderMode.brandAsset && brandAsset
        ? PortalLoginHeaderMode.brandAsset
        : PortalLoginHeaderMode.text;

    return {
      identity: {
        applicationDescription: text('applicationDescription'),
        applicationName: text('applicationName') ?? fallback.identity.applicationName,
        darkPalette: this.toPalette(portal, 'dark'),
        favicon: this.toMediaFile(portal.faviconFile, 'favicon'),
        fontScale: portal.fontScale,
        lightPalette: this.toPalette(portal, 'light'),
        supportText: text('supportText'),
        supportUrl: portal.supportUrl,
      },
      login: {
        brandAsset: headerMode === PortalLoginHeaderMode.brandAsset ? brandAsset : null,
        brandAssetAlt: text('loginBrandAssetAlt'),
        description: text('loginDescription'),
        headerIcon: headerMode === PortalLoginHeaderMode.text ? headerIcon : null,
        headerMode,
        layout: portal.loginLayout,
        media: Object.fromEntries(
          portal.loginMedia.flatMap((media) => {
            const asset = this.toMediaFile(
              media.file,
              media.mediaType === PortalLoginMediaType.video ? 'video' : 'image',
            );
            const poster = media.posterFile ? this.toMediaFile(media.posterFile, 'image') : null;

            return asset && (!media.posterFile || poster)
              ? [[media.slot, { asset, mediaType: media.mediaType, poster }]]
              : [];
          }),
        ),
        splitMediaPosition:
          portal.loginLayout === PortalLoginLayout.split ? portal.splitMediaPosition : null,
        title: text('loginTitle'),
      },
    };
  }

  private findTranslation(
    translations: PortalTranslation[],
    locale: string,
  ): PortalTranslation | null {
    return translations.find((translation) => translation.language.languageCode === locale) ?? null;
  }

  private toMediaFile(
    file: File | null,
    role: 'favicon' | 'icon' | 'brand' | 'image' | 'video',
  ): PortalMediaFile | null {
    const url = resolveFilePublicUrl(file);

    if (
      !file ||
      file.client !== null ||
      !url ||
      !isPortalAssetCompatible(role, file.mimeType, file.fileType)
    ) {
      return null;
    }

    return { fileType: file.fileType, id: file.id, mimeType: file.mimeType, url };
  }

  private toPalette(portal: Portal, mode: 'light' | 'dark'): PortalPalette {
    return {
      background: portal[`${mode}Background`],
      error: portal[`${mode}Error`],
      paper: portal[`${mode}Paper`],
      primary: portal[`${mode}Primary`],
      secondary: portal[`${mode}Secondary`],
      success: portal[`${mode}Success`],
      textPrimary: portal[`${mode}TextPrimary`],
      textSecondary: portal[`${mode}TextSecondary`],
      warning: portal[`${mode}Warning`],
      link: portal[`${mode}Link`],
    };
  }

  private fallback(): ResolvedPublicPortal {
    return {
      identity: {
        applicationDescription: 'Enterprise Administration',
        applicationName: 'Contenster Core',
        darkPalette: defaultPortalDarkPalette,
        favicon: null,
        fontScale: PortalFontScale.standard,
        lightPalette: defaultPortalLightPalette,
        supportText: 'Fale com o suporte',
        supportUrl: 'https://www.google.com',
      },
      login: {
        brandAsset: null,
        brandAssetAlt: null,
        description: null,
        headerIcon: null,
        headerMode: PortalLoginHeaderMode.text,
        layout: PortalLoginLayout.centered,
        media: {},
        splitMediaPosition: null,
        title: null,
      },
    };
  }
}
