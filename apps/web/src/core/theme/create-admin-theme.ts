import { createTheme, type Theme } from '@mui/material/styles';

import { baseThemeOptions } from './base.theme';
import { darkPaletteOptions } from './dark.theme';
import { lightPaletteOptions } from './light.theme';

export const ADMIN_COLOR_SCHEME_STORAGE_KEY = 'contenster-admin-color-scheme';
export const ADMIN_MODE_STORAGE_KEY = 'contenster-admin-mode';

export const adminTheme: Theme = createTheme({
  ...baseThemeOptions,
  colorSchemes: {
    dark: {
      palette: darkPaletteOptions,
    },
    light: {
      palette: lightPaletteOptions,
    },
  },
  cssVariables: {
    colorSchemeSelector: 'data',
  },
});
