'use client';

import type { AccessModelPreviewResponse } from '@contenster/shared';
import { Alert, Checkbox, FormControlLabel, Paper, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useGlobalContext } from '@/core/providers';
import { AccessModelChangeDetails } from '@/features/core/access-models/components/AccessModelChangeDetails';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, Page } from '@/shared';

export function AccessModelApplyView({ entityId, presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.access_models');
  const { apiRequest } = useGlobalContext();
  const [preview, setPreview] = useState<AccessModelPreviewResponse | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (entityId !== null) {
      void apiRequest<AccessModelPreviewResponse>({
        method: 'POST',
        endpoint: API_ROUTES.ADMIN.POST_ACCESS_MODEL_PREVIEW,
        body: { modelId: entityId },
        showSuccessMessage: false,
        onSuccess: (response) => setPreview(response.body ?? null),
      });
    }
  }, [apiRequest, entityId]);

  if (entityId === null) {
    return null;
  }

  return (
    <Page
      module={presentation.moduleName}
      functionality={presentation.functionalityName}
      description={presentation.description ?? undefined}
    >
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <Stack spacing={2}>
          {preview?.conflicts.map((conflict) => (
            <Alert key={conflict.code} severity="error">
              {conflict.message}
            </Alert>
          ))}
          {preview?.changes.map((change) => (
            <FormControlLabel
              disableTypography
              key={change.id}
              label={
                <div>
                  {`${t(change.kind)}: ${change.label}`}
                  <AccessModelChangeDetails change={change} />
                </div>
              }
              control={
                <Checkbox
                  checked={selected.includes(change.id)}
                  onChange={(_, checked) =>
                    setSelected((current) =>
                      checked ? [...current, change.id] : current.filter((id) => id !== change.id),
                    )
                  }
                />
              }
            />
          ))}
          <Button
            label={t('confirm')}
            type="button"
            disabled={!preview || !selected.length || preview.conflicts.length > 0}
            onClick={() =>
              void apiRequest({
                method: 'POST',
                endpoint: API_ROUTES.ADMIN.POST_ACCESS_MODEL_APPLY,
                successMessage: t('apply_success'),
                body: {
                  modelId: entityId,
                  fingerprint: preview?.fingerprint,
                  selectedChangeIds: selected,
                },
                onSuccess: () => {
                  setPreview(null);
                  setSelected([]);
                },
              })
            }
          />
        </Stack>
      </Paper>
    </Page>
  );
}
