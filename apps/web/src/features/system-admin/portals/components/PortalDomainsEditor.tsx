'use client';

import { Box, FormHelperText, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { normalizePortalHost } from '@contenster/shared';
import { Button, FormInput, IconButton } from '@/shared';

import type { PortalFormValues } from '../types/portal-form.types';

export function PortalDomainsEditor() {
  const t = useTranslations('protected.system_admin.portals');
  const {
    control,
    formState: { errors, isSubmitted },
    getValues,
    setValue,
  } = useFormContext<PortalFormValues>();
  const { append, fields, remove } = useFieldArray({ control, keyName: 'fieldId', name: 'hosts' });

  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t('domains.title')}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12.5, mt: 0.25 }}>
          {t('domains.description')}
        </Typography>
      </Box>

      <Stack spacing={1.25}>
        {fields.map((field, index) => (
          <Stack key={field.fieldId} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <FormInput<PortalFormValues>
              helperText={t('helpers.host')}
              label={t('fields.host')}
              name={`hosts.${index}.host`}
              required
              rules={{
                required: t('validation.host_required'),
                maxLength: { message: t('validation.host_too_long'), value: 253 },
                validate: {
                  duplicate: (value) => {
                    const host = typeof value === 'string' ? value : '';
                    const normalized = normalizePortalHost(host);

                    if (!normalized) return true;

                    return (
                      getValues('hosts').filter(
                        (item) => normalizePortalHost(item.host) === normalized,
                      ).length <= 1 || t('validation.host_duplicate')
                    );
                  },
                  format: (value) => {
                    const host = typeof value === 'string' ? value : '';

                    return Boolean(normalizePortalHost(host)) || t('validation.host_invalid');
                  },
                },
              }}
              slotProps={{ htmlInput: { maxLength: 253 } }}
              onBlur={(event) => {
                const normalized = normalizePortalHost(event.currentTarget.value);

                if (normalized) {
                  setValue(`hosts.${index}.host`, normalized, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: isSubmitted,
                  });
                }
              }}
            />
            <IconButton
              disabled={fields.length === 1}
              icon="trash"
              iconSize={18}
              size="small"
              sx={{ color: 'error.main', flexShrink: 0, height: 40, mt: 0.25, width: 40 }}
              toolTip={t('actions.remove_domain')}
              onClick={() => remove(index)}
            />
          </Stack>
        ))}
      </Stack>

      {errors.hosts?.message && <FormHelperText error>{errors.hosts.message}</FormHelperText>}

      <Box>
        <Button
          icon="plus"
          iconPosition="start"
          label={t('actions.add_domain')}
          type="button"
          variant="outlined"
          onClick={() => append({ host: '', id: null })}
        />
      </Box>
    </Stack>
  );
}
