import {
  defaultPortalDarkPalette as sharedDefaultPortalDarkPalette,
  defaultPortalLightPalette as sharedDefaultPortalLightPalette,
  normalizePortalHost,
  type PortalDetail,
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalLoginMediaSlot,
  PortalLoginMediaType,
  type PortalPalette,
  PortalSplitMediaPosition,
  type SavePortalRequest,
  type SessionLanguage,
} from '@contenster/shared';

import type { PortalFormValues } from './portal-form.types';

export const defaultPortalLightPalette: PortalPalette = sharedDefaultPortalLightPalette;

export const defaultPortalDarkPalette: PortalPalette = sharedDefaultPortalDarkPalette;

const portalMediaSlots = Object.values(PortalLoginMediaSlot);

const createPortalMedia = (detail: PortalDetail | null): PortalFormValues['loginMedia'] =>
  Object.fromEntries(
    portalMediaSlots.map((slot) => {
      const media = detail?.loginMedia.find((item) => item.slot === slot);

      return [
        slot,
        {
          fileId: media?.fileId ?? null,
          id: media?.id ?? null,
          mediaType: media?.mediaType ?? PortalLoginMediaType.image,
          posterFileId: media?.posterFileId ?? null,
        },
      ];
    }),
  ) as PortalFormValues['loginMedia'];

export const createPortalFormValues = (
  languages: SessionLanguage[],
  detail: PortalDetail | null = null,
): PortalFormValues => ({
  brandAssetFileId: detail?.brandAssetFileId ?? null,
  darkPalette: { ...(detail?.darkPalette ?? defaultPortalDarkPalette) },
  faviconFileId: detail?.faviconFileId ?? null,
  fontScale: detail?.fontScale ?? PortalFontScale.standard,
  headerIconFileId: detail?.headerIconFileId ?? null,
  hosts: (detail?.hosts ?? [{ host: '', id: null }]).map((host) => ({
    host: host.host,
    id: host.id,
  })),
  id: detail?.id ?? null,
  internalName: detail?.internalName ?? '',
  lightPalette: { ...(detail?.lightPalette ?? defaultPortalLightPalette) },
  loginHeaderMode: detail?.loginHeaderMode ?? PortalLoginHeaderMode.text,
  loginLayout: detail?.loginLayout ?? PortalLoginLayout.centered,
  loginMedia: createPortalMedia(detail),
  splitMediaPosition:
    detail?.loginLayout === PortalLoginLayout.split
      ? (detail.splitMediaPosition ?? PortalSplitMediaPosition.right)
      : null,
  supportUrl: detail?.supportUrl ?? '',
  translations: languages.map((language) => {
    const translation = detail?.translations.find((item) => item.locale === language.locale);

    return {
      applicationDescription: translation?.applicationDescription ?? null,
      applicationName: translation?.applicationName ?? null,
      id: translation?.id ?? null,
      locale: language.locale,
      loginBrandAssetAlt: translation?.loginBrandAssetAlt ?? null,
      loginDescription: translation?.loginDescription ?? null,
      loginTitle: translation?.loginTitle ?? null,
      supportText: translation?.supportText ?? null,
    };
  }),
});

export const mapPortalPayload = (values: PortalFormValues): SavePortalRequest => ({
  brandAssetFileId:
    values.loginHeaderMode === PortalLoginHeaderMode.brandAsset ? values.brandAssetFileId : null,
  darkPalette: values.darkPalette,
  faviconFileId: values.faviconFileId,
  fontScale: values.fontScale,
  headerIconFileId:
    values.loginHeaderMode === PortalLoginHeaderMode.text ? values.headerIconFileId : null,
  hosts: values.hosts.map((item) => ({
    host: normalizePortalHost(item.host) ?? item.host,
    id: item.id,
  })),
  id: values.id,
  internalName: values.internalName,
  lightPalette: values.lightPalette,
  loginHeaderMode: values.loginHeaderMode,
  loginLayout: values.loginLayout,
  loginMedia: portalMediaSlots.flatMap((slot) => {
    const media = values.loginMedia[slot];

    return !media.fileId
      ? []
      : [
          {
            fileId: media.fileId,
            id: media.id,
            mediaType: media.mediaType,
            posterFileId:
              media.mediaType === PortalLoginMediaType.video ? media.posterFileId : null,
            slot,
          },
        ];
  }),
  splitMediaPosition:
    values.loginLayout === PortalLoginLayout.split ? values.splitMediaPosition : null,
  supportUrl: values.supportUrl || null,
  translations: values.translations.filter((translation) =>
    Object.entries(translation).some(
      ([field, value]) => field !== 'id' && field !== 'locale' && value !== null && value !== '',
    ),
  ),
});
