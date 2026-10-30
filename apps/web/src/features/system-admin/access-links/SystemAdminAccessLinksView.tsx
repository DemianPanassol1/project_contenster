'use client';

import type {
  ReplaceSystemAdminAccessLinksRequest,
  SystemAdminAccessLinkClient,
  SystemAdminAccessLinkUserDetails,
} from '@contenster/shared';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

import { useGlobalContext } from '@/core/providers';
import { useToast } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { type SelectOption, usePOST } from '@/services/hooks';
import { Button, IconButton, Page } from '@/shared';

interface AccessLinkRow {
  clientId: number | null;
  id: number | null;
  profileId: number | null;
  rowId: string;
}

const optionsRequest = {
  isOptional: false,
  pagination: {
    filters: [],
    page: 1,
    perPage: 1000,
    sort: [{ direction: 'asc' as const, field: 'name' }],
  },
};

const getOptionKey = (option: SelectOption) => String(option.value);

export function SystemAdminAccessLinksView() {
  const theme = useTheme();
  const t = useTranslations('protected.system_admin.access_links');
  const tSystem = useTranslations('protected.system_admin');
  const { apiRequest } = useGlobalContext();
  const { errorMessage } = useToast();
  const rowSequence = useRef(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [accessData, setAccessData] = useState<SystemAdminAccessLinkUserDetails | null>(null);
  const [rows, setRows] = useState<AccessLinkRow[]>([]);
  const userOptionsRequest = usePOST<SelectOption[]>(
    API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_LINK_USER_OPTIONS,
    optionsRequest,
  );
  const userOptions = useMemo(
    () => (userOptionsRequest.data?.success ? (userOptionsRequest.data.body ?? []) : []),
    [userOptionsRequest.data],
  );
  const selectedUser = useMemo(
    () => userOptions.find((option) => option.value === selectedUserId) ?? null,
    [selectedUserId, userOptions],
  );
  const clientsById = useMemo(
    () => new Map((accessData?.clients ?? []).map((client) => [client.id, client])),
    [accessData],
  );
  const selectedClientIds = useMemo(
    () => new Set(rows.flatMap((row) => (row.clientId === null ? [] : [row.clientId]))),
    [rows],
  );
  const clientOptions = useMemo<SelectOption[]>(
    () =>
      (accessData?.clients ?? [])
        .filter((client) => client.isActive && client.profiles.some((profile) => profile.isActive))
        .map((client) => ({ label: client.tradeName, metadata: null, value: client.id })),
    [accessData],
  );

  const createRow = (): AccessLinkRow => {
    rowSequence.current += 1;

    return {
      clientId: null,
      id: null,
      profileId: null,
      rowId: `new-access-link-${rowSequence.current}`,
    };
  };

  const loadUserAccess = async (userId: number) => {
    const response = await apiRequest<SystemAdminAccessLinkUserDetails>({
      endpoint: API_ROUTES.SYSTEM_ADMIN.GET_ACCESS_LINK_USER_DETAILS(userId),
      method: 'GET',
      showSuccessMessage: false,
    });

    if (!response.success || !response.body) {
      setAccessData(null);
      setRows([]);
      return;
    }

    setAccessData(response.body);
    setRows(
      response.body.links.map((link) => ({
        clientId: link.clientId,
        id: link.id,
        profileId: link.profileId,
        rowId: `access-link-${link.id}`,
      })),
    );
  };

  const updateRow = (rowId: string, patch: Partial<AccessLinkRow>) => {
    setRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)));
  };

  const removeRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.rowId !== rowId));
  };

  const getClientOptions = (clientId: number | null): SelectOption[] => {
    if (clientId === null || clientOptions.some((option) => option.value === clientId)) {
      return clientOptions;
    }

    const client = clientsById.get(clientId);

    if (!client) {
      return clientOptions;
    }

    return [
      ...clientOptions,
      {
        disabled: true,
        label: `${client.tradeName} (${t('inactive')})`,
        metadata: null,
        value: client.id,
      },
    ];
  };

  const getProfileOptions = (
    client: SystemAdminAccessLinkClient | undefined,
    profileId: number | null,
  ) => {
    if (!client) {
      return [] as SelectOption[];
    }

    const activeOptions = client.profiles
      .filter((profile) => profile.isActive)
      .map((profile) => ({
        label: profile.name || t('unnamed_profile'),
        metadata: null,
        value: profile.id,
      }));

    if (profileId === null || activeOptions.some((option) => option.value === profileId)) {
      return activeOptions;
    }

    const selectedProfile = client.profiles.find((profile) => profile.id === profileId);

    if (!selectedProfile) {
      return activeOptions;
    }

    return [
      ...activeOptions,
      {
        disabled: true,
        label: `${selectedProfile.name || t('unnamed_profile')} (${t('inactive')})`,
        metadata: null,
        value: selectedProfile.id,
      },
    ];
  };

  const handleSave = async () => {
    if (selectedUserId === null) {
      errorMessage(t('select_user_required'));

      return;
    }

    if (rows.some((row) => row.clientId === null || row.profileId === null)) {
      errorMessage(t('complete_rows_required'));

      return;
    }

    const body: ReplaceSystemAdminAccessLinksRequest = {
      links: rows.map((row) => ({
        clientId: row.clientId!,
        id: row.id,
        profileId: row.profileId!,
      })),
    };

    await apiRequest({
      body,
      endpoint: API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_LINKS(selectedUserId),
      method: 'POST',
      onSuccess: () => loadUserAccess(selectedUserId),
    });
  };

  return (
    <Page description={t('description')} functionality={t('title')} module={tSystem('module')}>
      <Paper elevation={1} square={false} sx={{ p: { sm: 3, xs: 2 } }}>
        <Stack spacing={2}>
          <Stack
            direction={{ md: 'row', xs: 'column' }}
            spacing={1.5}
            sx={{ alignItems: { md: 'center', xs: 'stretch' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography
                component="h2"
                sx={{ color: 'text.primary', fontSize: 18, fontWeight: 700 }}
              >
                {t('title')}
              </Typography>
              {accessData && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.75 }}
                >
                  <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                    {accessData.user.name} ({accessData.user.username})
                  </Typography>
                  {accessData.user.isSuperuser && (
                    <Chip
                      label={t('superuser')}
                      size="small"
                      sx={{ borderRadius: 1, fontSize: 11, height: 22 }}
                    />
                  )}
                </Stack>
              )}
            </Box>

            <Stack direction={{ sm: 'row', xs: 'column' }} spacing={1}>
              <Button
                disabled={!accessData}
                icon="plus"
                iconPosition="start"
                label={t('add_link')}
                onClick={() => setRows((current) => [...current, createRow()])}
                variant="outlined"
              />
              <Button
                disabled={!accessData}
                icon="save"
                iconPosition="start"
                label={t('save_links')}
                onClick={handleSave}
              />
            </Stack>
          </Stack>

          <Autocomplete
            getOptionKey={getOptionKey}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            loading={userOptionsRequest.isLoading}
            onChange={(_, option) => {
              const userId = typeof option?.value === 'number' ? option.value : null;

              setSelectedUserId(userId);
              setAccessData(null);
              setRows([]);

              if (userId !== null) {
                void loadUserAccess(userId);
              }
            }}
            options={userOptions}
            renderInput={(params) => <TextField {...params} label={t('user')} size="small" />}
            value={selectedUser}
          />

          {!accessData ? (
            <Alert severity="info">{t('empty_user')}</Alert>
          ) : (
            <Stack spacing={1.5}>
              <Alert severity="warning">{t('replace_warning')}</Alert>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 260 }}>{t('client')}</TableCell>
                      <TableCell sx={{ minWidth: 260 }}>{t('profile')}</TableCell>
                      <TableCell align="right" sx={{ width: 72 }}>
                        {t('actions')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length ? (
                      rows.map((row) => {
                        const rowClientOptions = getClientOptions(row.clientId);
                        const client =
                          row.clientId === null ? undefined : clientsById.get(row.clientId);
                        const profileOptions = getProfileOptions(client, row.profileId);
                        const selectedClient =
                          rowClientOptions.find((option) => option.value === row.clientId) ?? null;
                        const selectedProfile =
                          profileOptions.find((option) => option.value === row.profileId) ?? null;

                        return (
                          <TableRow key={row.rowId}>
                            <TableCell>
                              <Autocomplete
                                getOptionDisabled={(option) =>
                                  Boolean(option.disabled) ||
                                  (selectedClientIds.has(Number(option.value)) &&
                                    option.value !== row.clientId)
                                }
                                getOptionKey={getOptionKey}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) =>
                                  option.value === value.value
                                }
                                onChange={(_, option) =>
                                  updateRow(row.rowId, {
                                    clientId:
                                      typeof option?.value === 'number' ? option.value : null,
                                    profileId: null,
                                  })
                                }
                                options={rowClientOptions}
                                renderInput={(params) => (
                                  <TextField {...params} label={t('client')} />
                                )}
                                size="small"
                                value={selectedClient}
                              />
                            </TableCell>
                            <TableCell>
                              <Autocomplete
                                disabled={!client}
                                getOptionDisabled={(option) => Boolean(option.disabled)}
                                getOptionKey={getOptionKey}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) =>
                                  option.value === value.value
                                }
                                onChange={(_, option) =>
                                  updateRow(row.rowId, {
                                    profileId:
                                      typeof option?.value === 'number' ? option.value : null,
                                  })
                                }
                                options={profileOptions}
                                renderInput={(params) => (
                                  <TextField {...params} label={t('profile')} />
                                )}
                                size="small"
                                value={selectedProfile}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                color={theme.palette.error.main}
                                icon="trash"
                                iconSize={18}
                                onClick={() => removeRow(row.rowId)}
                                size="small"
                                toolTip={t('remove_link')}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography sx={{ color: 'text.secondary', fontSize: 13, py: 2 }}>
                            {t('no_rows')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Page>
  );
}
