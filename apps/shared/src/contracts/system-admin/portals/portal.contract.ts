import type { FileType } from '../../../domain/media/file-type.enum.js';
import type {
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalLoginMediaSlot,
  PortalLoginMediaType,
  PortalSplitMediaPosition,
} from '../../../domain/portal/portal.enum.js';

export interface PortalPalette {
  background: string;
  error: string;
  paper: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
}

export interface PortalTranslationRequest {
  id: number | null;
  applicationDescription: string | null;
  applicationName: string | null;
  locale: string;
  loginBrandAssetAlt: string | null;
  loginDescription: string | null;
  loginTitle: string | null;
  supportText: string | null;
}

export interface PortalDomainRequest {
  host: string;
  id: number | null;
}

export interface PortalLoginMediaRequest {
  fileId: number;
  id: number | null;
  mediaType: PortalLoginMediaType;
  posterFileId: number | null;
  slot: PortalLoginMediaSlot;
}

export interface SavePortalRequest {
  brandAssetFileId: number | null;
  darkPalette: PortalPalette;
  faviconFileId: number | null;
  fontScale: PortalFontScale;
  headerIconFileId: number | null;
  hosts: PortalDomainRequest[];
  id: number | null;
  internalName: string;
  lightPalette: PortalPalette;
  loginHeaderMode: PortalLoginHeaderMode;
  loginLayout: PortalLoginLayout;
  loginMedia: PortalLoginMediaRequest[];
  splitMediaPosition: PortalSplitMediaPosition | null;
  supportUrl: string | null;
  translations: PortalTranslationRequest[];
}

export interface PortalMediaFile {
  fileType: FileType;
  id: number;
  mimeType: string;
  url: string;
}

export interface PortalListItem {
  hosts: string[];
  id: number;
  internalName: string;
  updatedAt: string;
}

export interface PortalDetail extends SavePortalRequest {
  brandAssetFile: PortalMediaFile | null;
  faviconFile: PortalMediaFile | null;
  headerIconFile: PortalMediaFile | null;
  loginMedia: Array<
    PortalLoginMediaRequest & {
      file: PortalMediaFile;
      id: number;
      posterFile: PortalMediaFile | null;
    }
  >;
  updatedAt: string;
}

export interface ResolvedPublicPortal {
  identity: {
    applicationDescription: string | null;
    applicationName: string;
    darkPalette: PortalPalette;
    favicon: PortalMediaFile | null;
    fontScale: PortalFontScale;
    lightPalette: PortalPalette;
    supportText: string | null;
    supportUrl: string | null;
  };
  login: {
    brandAsset: PortalMediaFile | null;
    brandAssetAlt: string | null;
    description: string | null;
    headerIcon: PortalMediaFile | null;
    headerMode: PortalLoginHeaderMode;
    layout: PortalLoginLayout;
    media: Partial<
      Record<
        PortalLoginMediaSlot,
        { asset: PortalMediaFile; mediaType: PortalLoginMediaType; poster: PortalMediaFile | null }
      >
    >;
    splitMediaPosition: PortalSplitMediaPosition | null;
    title: string | null;
  };
}
