'use client';

import type { AccessModelPreviewResponse } from '@contenster/shared';
import { Alert, Checkbox, FormControlLabel, Paper, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { useGlobalContext } from '@/core/providers';
import { AccessModelChangeDetails } from '@/features/core/access-models/components/AccessModelChangeDetails';
import { API_ROUTES } from '@/routes';
import { Button, FormSelect, FormWrapper, Page } from '@/shared';

export function SystemAdminAccessModelApplyView({ modelId }: { modelId: number }) {
  const t = useTranslations('protected.access_models');
  const { apiRequest } = useGlobalContext();
  const [preview, setPreview] = useState<AccessModelPreviewResponse | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const sequence = useRef(0);

  const generatePreview = async () => {
    if (!clientId) {
      return;
    }

    const requestSequence = ++sequence.current;
    setPreview(null);
    const response = await apiRequest<AccessModelPreviewResponse>({
      method: 'POST',
      endpoint: API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_MODEL_PREVIEW,
      body: { modelId, clientId },
      showSuccessMessage: false,
    });

    if (sequence.current !== requestSequence) {
      return;
    }
    setPreview(response.body ?? null);
    setSelected([]);
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

  return (
    <Page module={t('module')} functionality={t('apply_title')}>
      <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
        <FormWrapper<{ clientId: number | null }>
          fields={{ clientId: null }}
          onSubmit={() => false}
        >
          <Stack spacing={2}>
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
              }}
            />
            <Button
              type="button"
              label={t('preview')}
              disabled={!clientId}
              onClick={() => void generatePreview()}
            />
            {preview?.conflicts.map((conflict) => (
              <Alert key={conflict.code} severity="error">
                {conflict.message}
              </Alert>
            ))}
            {preview?.changes.map((change) => (
              <FormControlLabel
                disableTypography
                key={change.id}
                control={
                  <Checkbox
                    checked={selected.includes(change.id)}
                    onChange={(_, checked) =>
                      setSelected((current) =>
                        checked
                          ? [...current, change.id]
                          : current.filter((id) => id !== change.id),
                      )
                    }
                  />
                }
                label={
                  <div>
                    {`${t(change.kind)}: ${change.label}`}
                    <AccessModelChangeDetails change={change} />
                  </div>
                }
              />
            ))}
            <Button
              type="button"
              label={t('confirm')}
              disabled={!preview || !clientId || !selected.length || preview.conflicts.length > 0}
              onClick={() => void apply()}
            />
          </Stack>
        </FormWrapper>
      </Paper>
    </Page>
  );
}
