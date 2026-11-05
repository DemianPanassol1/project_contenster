'use client';

import type { AccessModelListItem, PaginatedBody } from '@contenster/shared';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { useGlobalContext, useModalContext } from '@/core/providers';
import { portalFontSize } from '@/core/theme';
import { AccessModelList } from '@/features/core/access-models/components/AccessModelList';
import {
  accessModelListRequest,
  filterAccessModelsByText,
} from '@/features/core/access-models/utils/access-model-list.utils';
import { useDebouncedValue } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { usePOST } from '@/services/hooks';
import { Button, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';

export function SystemAdminAccessModelsView() {
  const t = useTranslations('protected.access_models');
  const tForm = useTranslations('form');
  const router = useRouter();
  const { apiRequest } = useGlobalContext();
  const { closeModal, openModal } = useModalContext();
  const { languages } = useSystemAdminLanguages();
  const [searchDraft, setSearchDraft] = useState('');
  const search = useDebouncedValue(searchDraft, 450);
  const accessModelList = usePOST<PaginatedBody<AccessModelListItem>>(
    API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_MODEL_LIST,
    accessModelListRequest,
  );
  const models = useMemo(
    () => (accessModelList.data?.success ? (accessModelList.data.body?.items ?? []) : []),
    [accessModelList.data],
  );
  const filteredModels = useMemo(() => filterAccessModelsByText(models, search), [models, search]);

  const openDeleteConfirmation = (model: AccessModelListItem) => {
    let modalId = '';

    modalId = openModal({
      actions: [
        { closeOnClick: true, label: tForm('cancel'), variant: 'text' },
        {
          color: 'error',
          label: t('delete'),
          onClick: async () => {
            await apiRequest({
              body: { id: model.id },
              endpoint: API_ROUTES.SYSTEM_ADMIN.DELETE_ACCESS_MODELS,
              method: 'POST',
              onSuccess: async () => {
                await accessModelList.refresh();
                closeModal(modalId);
              },
            });
          },
          variant: 'contained',
        },
      ],
      content: (
        <Typography color="text.secondary" sx={{ fontSize: portalFontSize(13) }}>
          {t('delete_message')}
        </Typography>
      ),
      title: t('delete_title'),
    });
  };

  return (
    <Page
      module={t('module')}
      functionality={t('title')}
      actions={
        <Button
          icon="plus"
          iconPosition="start"
          label={t('create')}
          onClick={() => router.push('/system-admin/access-models/new')}
        />
      }
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
            languages={languages}
            models={filteredModels}
            onApply={(model) => router.push(`/system-admin/access-models/apply/${model.id}`)}
            onDelete={openDeleteConfirmation}
            onEdit={(model) => router.push(`/system-admin/access-models/update/${model.id}`)}
          />
        )}
      </Paper>
    </Page>
  );
}
