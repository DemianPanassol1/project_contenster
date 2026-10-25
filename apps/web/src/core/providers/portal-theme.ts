import { createTheme, type PaletteOptions, type Theme } from '@mui/material/styles';

import { PortalFontScale, type PortalPalette, type ResolvedPublicPortal } from '@contenster/shared';

export const PORTAL_COLOR_SCHEME_STORAGE_KEY = 'contenster-portal-color-scheme';
export const PORTAL_MODE_STORAGE_KEY = 'contenster-portal-mode';

const toPalette = (mode: 'dark' | 'light', palette: PortalPalette): PaletteOptions => ({
  background: { default: palette.background, paper: palette.paper },
  error: { main: palette.error },
  mode,
  primary: { main: palette.primary },
  secondary: { main: palette.secondary },
  success: { main: palette.success },
  warning: { main: palette.warning },
});

const fontSizeByScale: Record<PortalFontScale, number> = {
  [PortalFontScale.small]: 14,
  [PortalFontScale.standard]: 16,
  [PortalFontScale.large]: 18,
};

export const createPortalTheme = (portal: ResolvedPublicPortal): Theme =>
  createTheme({
    colorSchemes: {
      dark: { palette: toPalette('dark', portal.identity.darkPalette) },
      light: { palette: toPalette('light', portal.identity.lightPalette) },
    },
    cssVariables: { colorSchemeSelector: 'data' },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: fontSizeByScale[portal.identity.fontScale],
    },
  });
