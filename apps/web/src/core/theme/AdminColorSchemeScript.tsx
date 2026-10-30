import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { ADMIN_COLOR_SCHEME_STORAGE_KEY, ADMIN_MODE_STORAGE_KEY } from './create-admin-theme';

export function AdminColorSchemeScript() {
  return (
    <InitColorSchemeScript
      attribute="data"
      colorSchemeStorageKey={ADMIN_COLOR_SCHEME_STORAGE_KEY}
      defaultMode="dark"
      modeStorageKey={ADMIN_MODE_STORAGE_KEY}
    />
  );
}
