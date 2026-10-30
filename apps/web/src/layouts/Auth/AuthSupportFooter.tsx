'use client';

import { Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { usePortal } from '@/core/providers';

export function AuthSupportFooter() {
  const t = useTranslations('auth.common');
  const { identity } = usePortal();
  const supportLink = identity.supportUrl
    ? identity.supportUrl.startsWith('https:')
      ? { href: identity.supportUrl, rel: 'noopener noreferrer', target: '_blank' }
      : { href: identity.supportUrl }
    : null;

  if (!identity.supportText) {
    return null;
  }

  return (
    <Typography color="text.secondary" variant="caption">
      {t('need_help')}{' '}
      {supportLink ? (
        <Link sx={{ color: 'link.main', fontWeight: 600 }} underline="hover" {...supportLink}>
          {identity.supportText}
        </Link>
      ) : (
        identity.supportText
      )}
    </Typography>
  );
}
