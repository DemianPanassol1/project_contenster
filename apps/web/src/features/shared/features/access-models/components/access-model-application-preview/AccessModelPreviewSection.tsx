'use client';

import type {
  AccessModelPreviewAlignedResource,
  AccessModelPreviewChange,
} from '@contenster/shared';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { getAccessModelPreviewModuleKey } from '../../utils/access-model-preview.utils';

import type { AccessModelPreviewCategory } from './access-model-preview.types';
import { AccessModelPreviewChangeResource } from './AccessModelPreviewChangeResource';
import { AccessModelPreviewModuleGroup } from './AccessModelPreviewModuleGroup';
import { AccessModelPreviewStatusChip } from './AccessModelPreviewStatusChip';

interface AccessModelPreviewSectionProps {
  alignedResources?: AccessModelPreviewAlignedResource[];
  category: AccessModelPreviewCategory;
  changes: AccessModelPreviewChange[];
  defaultExpanded?: boolean;
  description: string;
  label: string;
  moduleNames: Record<string, string>;
  onCheckedChange: (changeId: string, checked: boolean) => void;
  selectedChangeIds: Set<string>;
  title?: string;
}

interface ChangeGroup {
  changes: AccessModelPreviewChange[];
  key: string;
  label: string;
  moduleKey: string | null;
}

const textPrimarySx = { color: 'text.primary' } as const;
const textSecondarySx = { color: 'text.secondary' } as const;

const getChangeGroups = (
  changes: AccessModelPreviewChange[],
  moduleNames: Record<string, string>,
): ChangeGroup[] => {
  const groups = new Map<string, ChangeGroup>();

  for (const change of changes) {
    const moduleKey = getAccessModelPreviewModuleKey(change);
    const key = moduleKey ?? `ungrouped:${change.id}`;
    const group = groups.get(key) ?? {
      changes: [],
      key,
      label: moduleKey ? (moduleNames[moduleKey] ?? moduleKey) : change.label,
      moduleKey,
    };

    if (change.kind.endsWith('_module')) {
      group.label = change.label;
    }

    group.changes.push(change);
    groups.set(key, group);
  }

  return [...groups.values()];
};

export function AccessModelPreviewSection({
  alignedResources = [],
  category,
  changes,
  defaultExpanded,
  description,
  label,
  moduleNames,
  onCheckedChange,
  selectedChangeIds,
  title,
}: AccessModelPreviewSectionProps) {
  const t = useTranslations('protected.access_models');
  const groups = useMemo(() => getChangeGroups(changes, moduleNames), [changes, moduleNames]);
  const alignedByModule = useMemo(() => {
    const resourcesByModule = new Map<string, AccessModelPreviewAlignedResource[]>();

    for (const resource of alignedResources) {
      const resources = resourcesByModule.get(resource.moduleKey) ?? [];

      resources.push(resource);
      resourcesByModule.set(resource.moduleKey, resources);
    }

    return [...resourcesByModule.entries()].map(([moduleKey, resources]) => ({
      label: resources.find((resource) => resource.type === 'module')?.label ?? moduleKey,
      moduleKey,
      resources,
    }));
  }, [alignedResources]);

  return (
    <Stack spacing={1.25}>
      {title && (
        <Typography sx={{ ...textPrimarySx, fontSize: 16, fontWeight: 700 }}>{title}</Typography>
      )}
      <Accordion
        defaultExpanded={defaultExpanded && (changes.length > 0 || alignedResources.length > 0)}
        disableGutters
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: '8px !important',
          '&::before': { display: 'none' },
        }}
      >
        <AccordionSummary sx={{ minHeight: 64, '& .MuiAccordionSummary-content': { my: 1 } }}>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.25, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...textPrimarySx, fontSize: 14, fontWeight: 700 }}>
                {label}
              </Typography>
              <Typography sx={{ ...textSecondarySx, fontSize: 12 }}>{description}</Typography>
            </Box>
            <Chip
              label={changes.length + alignedResources.length}
              size="small"
              sx={{ fontWeight: 700, mr: 1, minWidth: 34 }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ display: 'grid', gap: 1.25, pt: 0 }}>
          <Stack spacing={1.5}>
            {groups.length === 0 && alignedByModule.length === 0 ? (
              <Typography sx={{ ...textSecondarySx, fontSize: 13 }}>{description}</Typography>
            ) : (
              groups.map((group) => (
                <AccessModelPreviewModuleGroup
                  key={group.key}
                  label={group.label}
                  moduleKey={group.moduleKey}
                >
                  {group.changes.map((change) => (
                    <AccessModelPreviewChangeResource
                      category={category}
                      change={change}
                      checked={selectedChangeIds.has(change.id)}
                      key={change.id}
                      moduleNames={moduleNames}
                      onCheckedChange={(checked) => onCheckedChange(change.id, checked)}
                    />
                  ))}
                </AccessModelPreviewModuleGroup>
              ))
            )}
            {alignedByModule.map(({ label: moduleLabel, moduleKey, resources }) => (
              <AccessModelPreviewModuleGroup
                key={moduleKey}
                label={moduleLabel}
                moduleKey={moduleKey}
              >
                {resources.map((resource) => (
                  <Box
                    key={resource.id}
                    sx={{
                      alignItems: 'center',
                      bgcolor: 'action.hover',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      gap: 1,
                      minHeight: 44,
                      px: 1.5,
                      py: 0.75,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ ...textPrimarySx, fontSize: 13, fontWeight: 700 }}>
                        {resource.type === 'module'
                          ? t('preview_module_configuration')
                          : resource.label}
                      </Typography>
                      <Typography sx={{ ...textSecondarySx, fontSize: 12 }}>
                        {resource.type === 'module' ? t('preview_module') : t('functionality')}
                      </Typography>
                    </Box>
                    <AccessModelPreviewStatusChip
                      label={t('preview_status_aligned')}
                      tone="success"
                    />
                  </Box>
                ))}
              </AccessModelPreviewModuleGroup>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
