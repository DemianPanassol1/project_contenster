import { Alert, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';

export async function AccessDeniedView() {
  const t = await getTranslations('protected.access_denied');

  return (
    <Alert severity="warning">
      <Typography component="h1" variant="h6">
        {t('title')}
      </Typography>
      {t('message')}
    </Alert>
  );
}
