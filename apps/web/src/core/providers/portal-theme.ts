import type { PortalPalette, ResolvedPublicPortal } from '@contenster/shared';
import {
  createTheme,
  type PaletteColor,
  type PaletteOptions,
  type SimplePaletteColorOptions,
  type Theme,
} from '@mui/material/styles';

import { baseThemeOptions, getPortalFontScaleMultiplier, portalFontSize } from '@/core/theme';

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

const createPortalTypography = () => {
  return {
    ...baseThemeOptions.typography,
    body1: {
      ...baseThemeOptions.typography.body1,
      fontSize: portalFontSize(15),
    },
    body2: {
      ...baseThemeOptions.typography.body2,
      fontSize: portalFontSize(14),
    },
    button: { fontSize: portalFontSize(14) },
    caption: { fontSize: portalFontSize(12) },
    h1: { ...baseThemeOptions.typography.h1, fontSize: portalFontSize(96) },
    h2: { ...baseThemeOptions.typography.h2, fontSize: portalFontSize(60) },
    h3: { ...baseThemeOptions.typography.h3, fontSize: portalFontSize(48) },
    h4: { ...baseThemeOptions.typography.h4, fontSize: portalFontSize(34) },
    h5: { ...baseThemeOptions.typography.h5, fontSize: portalFontSize(24) },
    h6: { ...baseThemeOptions.typography.h6, fontSize: portalFontSize(20) },
    overline: { fontSize: portalFontSize(12) },
    subtitle1: { fontSize: portalFontSize(16) },
    subtitle2: { fontSize: portalFontSize(14) },
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
          body: {
            '--portal-font-scale': String(getPortalFontScaleMultiplier(portal.identity.fontScale)),
            fontSize: portalFontSize(14),
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
    typography: createPortalTypography(),
  });
