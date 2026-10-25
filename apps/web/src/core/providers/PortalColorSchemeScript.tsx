import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { PORTAL_COLOR_SCHEME_STORAGE_KEY, PORTAL_MODE_STORAGE_KEY } from './portal-theme';

export function PortalColorSchemeScript() {
  return (
    <InitColorSchemeScript
      attribute="data"
      colorSchemeStorageKey={PORTAL_COLOR_SCHEME_STORAGE_KEY}
      defaultMode="system"
      modeStorageKey={PORTAL_MODE_STORAGE_KEY}
    />
  );
}
