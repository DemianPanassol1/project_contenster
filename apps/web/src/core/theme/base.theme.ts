import type { ThemeOptions } from '@mui/material/styles';

import { portalFontSize } from './portal-font-scale';

export const baseThemeOptions = {
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: {
      fontSize: portalFontSize(15),
      fontWeight: 400,
    },
    body2: {
      fontSize: portalFontSize(14),
      fontWeight: 400,
    },
  },
} satisfies ThemeOptions;
