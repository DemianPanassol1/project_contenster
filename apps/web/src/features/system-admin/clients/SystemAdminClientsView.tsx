'use client';

import type { PaginatedBody, PaginateRequest, SystemAdminClientListItem } from '@contenster/shared';
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
import { useDebouncedValue } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { usePOST } from '@/services/hooks';
import { Page } from '@/shared';

import { SystemAdminClientsList } from './components/SystemAdminClientsList';

const MAX_CLIENTS_PER_PAGE = 1000;

const createListRequest = (search: string): PaginateRequest => ({
  isOptional: false,
  pagination: {
    filters: search
      ? [
          {
            disjunctive: true,
            field: 'corporateName',
            operator: 'contains',
            type: 'string',
            value: search,
          },
          {
            disjunctive: true,
            field: 'tradeName',
            operator: 'contains',
            type: 'string',
            value: search,
          },
          {
            disjunctive: true,
            field: 'document',
            operator: 'contains',
            type: 'string',
            value: search,
          },
        ]
      : [],
    page: 1,
    perPage: MAX_CLIENTS_PER_PAGE,
    sort: [{ direction: 'asc', field: 'tradeName' }],
  },
});

export function SystemAdminClientsView() {
  const t = useTranslations('protected.system_admin.clients');
  const tSystem = useTranslations('protected.system_admin');
  const tForm = useTranslations('form');

  const { apiRequest } = useGlobalContext();
  const { closeModal, openModal } = useModalContext();
  const [searchDraft, setSearchDraft] = useState('');
  const search = useDebouncedValue(searchDraft, 450);
  const request = useMemo(() => createListRequest(search), [search]);
  const clientList = usePOST<PaginatedBody<SystemAdminClientListItem>>(
    API_ROUTES.SYSTEM_ADMIN.POST_CLIENT_LIST,
    request,
  );
  const clients = clientList.data?.success ? (clientList.data.body?.items ?? []) : [];

  const openDeleteConfirmation = (client: SystemAdminClientListItem) => {
    let modalId = '';

    modalId = openModal({
      actions: [
        { closeOnClick: true, label: tForm('cancel'), variant: 'text' },
        {
          color: 'error',
          label: t('delete_client'),
          onClick: async () => {
            await apiRequest({
              endpoint: API_ROUTES.SYSTEM_ADMIN.DELETE_CLIENT(client.id),
              method: 'DELETE',
              onSuccess: async () => {
                await clientList.refresh();
                closeModal(modalId);
              },
            });
          },
          variant: 'contained',
        },
      ],
      content: (
        <Typography sx={{ fontSize: '13px' }}>{t('delete_confirmation_message')}</Typography>
      ),
      title: t('delete_confirmation_title'),
    });
  };

  const openActiveConfirmation = (client: SystemAdminClientListItem) => {
    const nextActiveState = !client.isActive;
    let modalId = '';

    modalId = openModal({
      actions: [
        { closeOnClick: true, label: tForm('cancel'), variant: 'text' },
        {
          color: 'warning',
          label: nextActiveState ? t('activate_client') : t('deactivate_client'),
          onClick: async () => {
            await apiRequest({
              body: { isActive: nextActiveState },
              endpoint: API_ROUTES.SYSTEM_ADMIN.PATCH_CLIENT_ACTIVE(client.id),
              method: 'PATCH',
              onSuccess: async () => {
                await clientList.refresh();
                closeModal(modalId);
              },
            });
          },
          variant: 'contained',
        },
      ],
      content: (
        <Typography sx={{ fontSize: '13px' }}>
          {nextActiveState
            ? t('activate_confirmation_message')
            : t('deactivate_confirmation_message')}
        </Typography>
      ),
      title: nextActiveState
        ? t('activate_confirmation_title')
        : t('deactivate_confirmation_title'),
    });
  };

  return (
    <Page description={t('description')} functionality={t('title')} module={tSystem('module')}>
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

        {clientList.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <SystemAdminClientsList
            clients={clients}
            onDelete={openDeleteConfirmation}
            onToggleActive={openActiveConfirmation}
          />
        )}
      </Paper>
    </Page>
  );
}
