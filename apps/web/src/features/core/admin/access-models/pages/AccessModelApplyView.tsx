'use client';

import type { AccessModelPreviewResponse } from '@contenster/shared';
import { Alert, Paper, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useGlobalContext } from '@/core/providers';
import { AccessModelApplicationPreview } from '@/features/shared/features/access-models/components/AccessModelApplicationPreview';
import { getDefaultSelectedAccessModelChangeIds } from '@/features/shared/features/access-models/utils/access-model-preview.utils';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, Page } from '@/shared';

export function AccessModelApplyView({ entityId, presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.access_models');
  const { apiRequest } = useGlobalContext();
  const [preview, setPreview] = useState<AccessModelPreviewResponse | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const generatePreview = async () => {
    if (entityId === null) {
      return;
    }

    setPreview(null);
    setSelected([]);
    setIsLoadingPreview(true);

    try {
      const response = await apiRequest<AccessModelPreviewResponse>({
        method: 'POST',
        endpoint: API_ROUTES.ADMIN.POST_ACCESS_MODEL_PREVIEW,
        body: { modelId: entityId },
        showSuccessMessage: false,
      });

      const nextPreview = response.body ?? null;

      setPreview(nextPreview);
      setSelected(nextPreview ? getDefaultSelectedAccessModelChangeIds(nextPreview) : []);
    } finally {
      setIsLoadingPreview(false);
    }
  };

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
          {isLoadingPreview && <Alert severity="info">{t('preview_loading')}</Alert>}
          {!isLoadingPreview && !preview && (
            <Alert severity="info">{t('preview_not_generated')}</Alert>
          )}
          {preview && (
            <AccessModelApplicationPreview
              preview={preview}
              selectedChangeIds={selected}
              onSelectedChangeIdsChange={setSelected}
              onApply={() =>
                void apiRequest({
                  method: 'POST',
                  endpoint: API_ROUTES.ADMIN.POST_ACCESS_MODEL_APPLY,
                  successMessage: t('apply_success'),
                  body: {
                    modelId: entityId,
                    fingerprint: preview.fingerprint,
                    selectedChangeIds: selected,
                  },
                  onSuccess: () => {
                    setPreview(null);
                    setSelected([]);
                  },
                })
              }
            />
          )}
          <Button
            label={t('preview')}
            type="button"
            disabled={isLoadingPreview}
            onClick={() => void generatePreview()}
          />
        </Stack>
      </Paper>
    </Page>
  );
}
