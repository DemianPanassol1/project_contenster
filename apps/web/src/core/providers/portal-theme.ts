import {
  createTheme,
  type PaletteColor,
  type PaletteOptions,
  type SimplePaletteColorOptions,
  type Theme,
} from '@mui/material/styles';

import { PortalFontScale, type PortalPalette, type ResolvedPublicPortal } from '@contenster/shared';
import { baseThemeOptions } from '@/core/theme';

export const PORTAL_COLOR_SCHEME_STORAGE_KEY = 'contenster-portal-color-scheme';
export const PORTAL_MODE_STORAGE_KEY = 'contenster-portal-mode';

declare module '@mui/material/styles' {
  interface Palette {
    link: PaletteColor;
  }

  interface PaletteOptions {
    link?: SimplePaletteColorOptions;
  }
}

const toPalette = (mode: 'dark' | 'light', palette: PortalPalette): PaletteOptions => ({
  background: { default: palette.background, paper: palette.paper },
  divider: mode === 'light' ? '#E5E7EB' : '#1E293B',
  error: { main: palette.error },
  link: { main: palette.link },
  mode,
  primary: { main: palette.primary },
  secondary: { main: palette.secondary },
  success: { main: palette.success },
  text: { primary: palette.textPrimary, secondary: palette.textSecondary },
  warning: { main: palette.warning },
});

const fontPresetByScale: Record<PortalFontScale, { body1: number; body2: number }> = {
  [PortalFontScale.small]: { body1: 14, body2: 13 },
  [PortalFontScale.standard]: { body1: 15, body2: 14 },
  [PortalFontScale.large]: { body1: 16, body2: 15 },
};

const createPortalTypography = (fontScale: PortalFontScale) => {
  const preset = fontPresetByScale[fontScale];

  return {
    ...baseThemeOptions.typography,
    body1: {
      ...baseThemeOptions.typography.body1,
      fontSize: `${preset.body1 / 16}rem`,
    },
    body2: {
      ...baseThemeOptions.typography.body2,
      fontSize: `${preset.body2 / 16}rem`,
    },
    fontSize: preset.body2,
  };
};

export const createPortalTheme = (portal: ResolvedPublicPortal): Theme =>
  createTheme({
    ...baseThemeOptions,
    colorSchemes: {
      dark: { palette: toPalette('dark', portal.identity.darkPalette) },
      light: { palette: toPalette('light', portal.identity.lightPalette) },
    },
    cssVariables: { colorSchemeSelector: 'data' },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            color: 'var(--mui-palette-link-main)',
            textDecorationColor: 'currentcolor',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'var(--mui-palette-link-main)',
          },
        },
      },
    },
    typography: createPortalTypography(portal.identity.fontScale),
  });
