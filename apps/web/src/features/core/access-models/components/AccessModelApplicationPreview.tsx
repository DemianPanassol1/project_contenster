'use client';

import type { AccessModelPreviewChange, AccessModelPreviewResponse } from '@contenster/shared';
import { Alert, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Button } from '@/shared';

import { getNextSelectedAccessModelChangeIds } from '../utils/access-model-preview.utils';

import { AccessModelPreviewSection } from './access-model-application-preview/AccessModelPreviewSection';
import { AccessModelPreviewSummary } from './access-model-application-preview/AccessModelPreviewSummary';

interface AccessModelApplicationPreviewProps {
  onApply?: () => void;
  onSelectedChangeIdsChange: (changeIds: string[]) => void;
  preview: AccessModelPreviewResponse;
  selectedChangeIds: string[];
  showApplyAction?: boolean;
  showStatusAlert?: boolean;
}

const isAddition = (change: AccessModelPreviewChange) =>
  change.kind === 'create_module' || change.kind === 'create_functionality';

const isExistingResource = (change: AccessModelPreviewChange) =>
  change.kind === 'update_module' || change.kind === 'update_functionality';

export function AccessModelApplicationPreview({
  onApply,
  onSelectedChangeIdsChange,
  preview,
  selectedChangeIds,
  showApplyAction = true,
  showStatusAlert = true,
}: AccessModelApplicationPreviewProps) {
  const t = useTranslations('protected.access_models');
  const selected = useMemo(() => new Set(selectedChangeIds), [selectedChangeIds]);
  const additions = preview.changes.filter(isAddition);
  const existing = preview.changes.filter(isExistingResource);
  const outside = preview.changes.filter(
    (change) => change.kind === 'delete_module' || change.kind === 'delete_functionality',
  );
  const hasConflicts = preview.conflicts.length > 0;
  const moduleNames = preview.moduleNames ?? {};

  const updateSelection = (changeId: string, checked: boolean) => {
    onSelectedChangeIdsChange(
      getNextSelectedAccessModelChangeIds(preview, selectedChangeIds, changeId, checked),
    );
  };

  return (
    <Stack spacing={2.5}>
      {showStatusAlert &&
        (hasConflicts ? (
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

      <AccessModelPreviewSummary
        additions={additions.length}
        conflicts={preview.conflicts.length}
        existing={existing.length + preview.alignedResources.length}
        outside={outside.length}
      />

      <Stack spacing={1.25}>
        <AccessModelPreviewSection
          category="additions"
          changes={additions}
          defaultExpanded
          description={t('preview_additions_description')}
          label={t('preview_additions')}
          moduleNames={moduleNames}
          onCheckedChange={updateSelection}
          selectedChangeIds={selected}
          title={t('preview_details')}
        />
        <AccessModelPreviewSection
          alignedResources={preview.alignedResources}
          category="existing"
          changes={existing}
          description={t('preview_existing_description')}
          label={t('preview_existing')}
          moduleNames={moduleNames}
          onCheckedChange={updateSelection}
          selectedChangeIds={selected}
        />
        <AccessModelPreviewSection
          category="outside"
          changes={outside}
          description={t('preview_outside_description')}
          label={t('preview_outside')}
          moduleNames={moduleNames}
          onCheckedChange={updateSelection}
          selectedChangeIds={selected}
        />
      </Stack>

      {showApplyAction && onApply && (
        <Button
          disabled={hasConflicts || selectedChangeIds.length === 0}
          icon="check"
          label={t('confirm')}
          type="button"
          onClick={onApply}
        />
      )}
    </Stack>
  );
}
