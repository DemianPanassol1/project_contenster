'use client';

import type { AccessModelPreviewChange } from '@contenster/shared';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export function AccessModelChangeDetails({ change }: { change: AccessModelPreviewChange }) {
  const t = useTranslations('protected.access_models');
  const before = change.currentValue
    ? (JSON.parse(change.currentValue) as Record<string, unknown> | null)
    : null;
  const after = change.proposedValue
    ? (JSON.parse(change.proposedValue) as Record<string, unknown> | null)
    : null;
  const fields = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])];
  const labels: Record<string, string> = {
    order: t('order'),
    isActive: t('active'),
    icon: t('icon'),
    isNavigationGroup: t('navigation_group'),
    parentSlug: t('parent'),
    moduleKey: t('module_key'),
    translations: t('translations'),
    enabledLanguageCodes: t('enabled_languages'),
    synchronizeAdminPermissions: t('admin_permissions'),
  };
  const display = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? t('yes') : t('no');
    }
    if (Array.isArray(value)) {
      return value
        .map((item: unknown) =>
          typeof item === 'object' && item !== null
            ? Object.values(item).filter(Boolean).join(' · ')
            : String(item),
        )
        .join('; ');
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  };
  return (
    <Box sx={{ overflowX: 'auto' }}>
      {fields.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('field')}</TableCell>
              <TableCell>{t('current')}</TableCell>
              <TableCell>{t('proposed')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields
              .filter((field) => JSON.stringify(before?.[field]) !== JSON.stringify(after?.[field]))
              .map((field) => (
                <TableRow key={field}>
                  <TableCell>{labels[field] ?? field}</TableCell>
                  <TableCell>{display(before?.[field])}</TableCell>
                  <TableCell>{display(after?.[field])}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
      {change.affectedItems.length > 0 && (
        <Typography>
          {t('affected')}: {change.affectedItems.join(', ')}
        </Typography>
      )}
    </Box>
  );
}
