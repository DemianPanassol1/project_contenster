'use client';

import type { AccessModelListItem, PaginatedBody } from '@contenster/shared';
import { Box, CircularProgress, IconButton, InputAdornment, Paper, TextField } from '@mui/material';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { AccessModelList } from '@/features/core/access-models/components/AccessModelList';
import {
  accessModelListRequest,
  filterAccessModelsByText,
} from '@/features/core/access-models/utils/access-model-list.utils';
import { crudUpdatePath } from '@/features/shared/navigation';
import { useDebouncedValue } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { usePOST } from '@/services/hooks';
import { Page } from '@/shared';

export function AccessModelsListView({ functionalitySlug, presentation }: AdminFeatureViewProps) {
  const t = useTranslations('protected.access_models');
  const router = useRouter();
  const [searchDraft, setSearchDraft] = useState('');
  const search = useDebouncedValue(searchDraft, 450);
  const accessModelList = usePOST<PaginatedBody<AccessModelListItem>>(
    API_ROUTES.ADMIN.POST_ACCESS_MODEL_LIST,
    accessModelListRequest,
  );
  const models = useMemo(
    () => (accessModelList.data?.success ? (accessModelList.data.body?.items ?? []) : []),
    [accessModelList.data],
  );
  const filteredModels = useMemo(() => filterAccessModelsByText(models, search), [models, search]);

  return (
    <Page
      module={presentation.moduleName}
      functionality={presentation.functionalityName}
      description={presentation.description ?? undefined}
    >
      <Paper elevation={1} square={false} sx={{ p: { sm: 3, xs: 2 } }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder={t('search_placeholder')}
            size="small"
            slotProps={{
              input: {
                endAdornment: searchDraft ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('clear_search')}
                      edge="end"
                      onClick={() => setSearchDraft('')}
                      size="small"
                    >
                      <X size={16} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={17} />
                  </InputAdornment>
                ),
              },
            }}
            value={searchDraft}
          />
        </Box>

        {accessModelList.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <AccessModelList
            languages={presentation.languages}
            models={filteredModels}
            onApply={(model) => router.push(crudUpdatePath(functionalitySlug, model.id))}
          />
        )}
      </Paper>
    </Page>
  );
}
