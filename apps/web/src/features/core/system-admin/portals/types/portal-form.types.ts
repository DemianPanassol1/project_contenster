import type {
  PortalFontScale,
  PortalLoginHeaderMode,
  PortalLoginLayout,
  PortalLoginMediaSlot,
  PortalLoginMediaType,
  PortalPalette,
  PortalSplitMediaPosition,
  PortalTranslationRequest,
} from '@contenster/shared';

export type PortalFormTab = 'general' | 'domains' | 'identity' | 'login';

export interface PortalHostFormValue {
  host: string;
  id: number | null;
}

export interface PortalMediaFormValue {
  fileId: number | null;
  id: number | null;
  mediaType: PortalLoginMediaType;
  posterFileId: number | null;
}

export interface PortalFormValues {
  brandAssetFileId: number | null;
  darkPalette: PortalPalette;
  faviconFileId: number | null;
  fontScale: PortalFontScale;
  headerIconFileId: number | null;
  hosts: PortalHostFormValue[];
  id: number | null;
  internalName: string;
  lightPalette: PortalPalette;
  loginHeaderMode: PortalLoginHeaderMode;
  loginLayout: PortalLoginLayout;
  loginMedia: Record<PortalLoginMediaSlot, PortalMediaFormValue>;
  splitMediaPosition: PortalSplitMediaPosition | null;
  supportUrl: string;
  translations: PortalTranslationRequest[];
}
