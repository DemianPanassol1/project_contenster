'use client';

import type { AccessModelPreviewResponse } from '@contenster/shared';
import { Alert, Paper, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { useGlobalContext } from '@/core/providers';
import { AccessModelApplicationPreview } from '@/features/shared/features/access-models/components/AccessModelApplicationPreview';
import { getDefaultSelectedAccessModelChangeIds } from '@/features/shared/features/access-models/utils/access-model-preview.utils';
import { API_ROUTES } from '@/routes';
import { Button, FormSelect, FormWrapper, Page } from '@/shared';

export function SystemAdminAccessModelApplyView({ modelId }: { modelId: number }) {
  const t = useTranslations('protected.access_models');
  const { apiRequest } = useGlobalContext();
  const [preview, setPreview] = useState<AccessModelPreviewResponse | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const sequence = useRef(0);

  const generatePreview = async () => {
    if (!clientId) {
      return;
    }

    const requestSequence = ++sequence.current;

    setPreview(null);
    setSelected([]);
    setIsLoadingPreview(true);

    try {
      const response = await apiRequest<AccessModelPreviewResponse>({
        method: 'POST',
        endpoint: API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_MODEL_PREVIEW,
        body: { modelId, clientId },
        showSuccessMessage: false,
      });

      if (sequence.current !== requestSequence) {
        return;
      }

      const nextPreview = response.body ?? null;

      setPreview(nextPreview);
      setSelected(nextPreview ? getDefaultSelectedAccessModelChangeIds(nextPreview) : []);
    } finally {
      if (sequence.current === requestSequence) {
        setIsLoadingPreview(false);
      }
    }
  };

  const apply = async () => {
    if (!preview || !clientId) {
      return;
    }

    const response = await apiRequest({
      method: 'POST',
      endpoint: API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_MODEL_APPLY,
      successMessage: t('apply_success'),
      body: { modelId, clientId, fingerprint: preview.fingerprint, selectedChangeIds: selected },
    });

    if (response.success) {
      setPreview(null);
      setSelected([]);
    }
  };

  const resetApplication = (reset: (values: { clientId: null }) => void) => {
    sequence.current++;
    reset({ clientId: null });
    setClientId(null);
    setPreview(null);
    setSelected([]);
    setIsLoadingPreview(false);
  };

  return (
    <Page module={t('module')} functionality={t('apply_title')}>
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <FormWrapper<{ clientId: number | null }>
          fields={{ clientId: null }}
          onSubmit={() => false}
          showPaper={false}
        >
          {({ reset }) => (
            <Stack spacing={2}>
              {isLoadingPreview && <Alert severity="info">{t('preview_loading')}</Alert>}
              {!isLoadingPreview && clientId && !preview && (
                <Alert severity="info">{t('preview_not_generated')}</Alert>
              )}
              {preview &&
                (preview.conflicts.length > 0 ? (
                  <Stack spacing={1}>
                    {preview.conflicts.map((conflict) => (
                      <Alert key={conflict.code} severity="error">
                        {conflict.message}
                      </Alert>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="success">{t('preview_ready')}</Alert>
                ))}
              <FormSelect<{ clientId: number | null }>
                label={t('client')}
                name="clientId"
                optionsEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_FILE_CLIENT_OPTIONS}
                optionsMethod="POST"
                optionsBody={{
                  isOptional: false,
                  pagination: { page: 1, perPage: 1000, filters: [], sort: [] },
                }}
                onValueChange={(value) => {
                  sequence.current++;
                  setClientId(typeof value === 'number' ? value : null);
                  setPreview(null);
                  setSelected([]);
                  setIsLoadingPreview(false);
                }}
              />
              {preview && (
                <AccessModelApplicationPreview
                  preview={preview}
                  selectedChangeIds={selected}
                  showApplyAction={false}
                  showStatusAlert={false}
                  onSelectedChangeIdsChange={setSelected}
                />
              )}
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    disabled={!clientId || isLoadingPreview || Boolean(preview)}
                    label={t('preview')}
                    sx={{ flex: 1 }}
                    type="button"
                    onClick={() => void generatePreview()}
                  />
                  <Button
                    disabled={!preview || preview.conflicts.length > 0 || selected.length === 0}
                    icon="check"
                    label={t('confirm')}
                    sx={{ flex: 1 }}
                    type="button"
                    onClick={() => void apply()}
                  />
                </Stack>
                <Button
                  disabled={!clientId && !preview && !isLoadingPreview}
                  label={t('reset_application')}
                  type="button"
                  variant="outlined"
                  onClick={() => resetApplication(reset)}
                />
              </Stack>
            </Stack>
          )}
        </FormWrapper>
      </Paper>
    </Page>
  );
}
