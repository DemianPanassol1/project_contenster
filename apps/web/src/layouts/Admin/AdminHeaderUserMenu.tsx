'use client';

import { Avatar, Box, Button, CircularProgress, Menu, MenuItem, Typography } from '@mui/material';
import { Building2, KeyRound, Landmark, LogOut, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  type ChangeCurrentUserPasswordRequest,
  RequestLogAccessType,
  type SessionClient,
  type SessionProfile,
  type SessionUser,
  type SwitchClientRequest,
} from '@contenster/shared';
import { useGlobalContext, useModalContext } from '@/core/providers';
import { useValidationRules, useWebResponseErrorToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { getAvailableClients, signOut, switchClient, switchGlobal } from '@/services/actions';
import type { FetchOptionsResponse, SelectOption } from '@/services/hooks';
import { FormPasswordInput, FormSelect, FormWrapper } from '@/shared/form';
import { FormatUtils } from '@/utils';

interface AdminHeaderUserMenuProps {
  accessType: RequestLogAccessType;
  client: SessionClient;
  profile: SessionProfile;
  user: SessionUser;
}

const changePasswordFormId = 'change-password-form';
const changeClientFormId = 'change-client-form';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  return `${parts[0][0]}${parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''}`.toUpperCase();
};

const stringToColor = (value: string): string => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  return `hsl(${Math.abs(hash) % 360}, 70%, 55%)`;
};

const formatClientOption = (option: SelectOption): string => {
  const document = option.metadata?.document;
  const documentType = option.metadata?.documentType;
  const formattedDocument =
    typeof document === 'string'
      ? FormatUtils.formatDocument(document, typeof documentType === 'string' ? documentType : null)
      : '';

  return formattedDocument ? `${option.label} (${formattedDocument})` : option.label;
};

export function AdminHeaderUserMenu({
  accessType,
  client,
  profile,
  user,
}: AdminHeaderUserMenuProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('global');
  const tForm = useTranslations('form');
  const { apiRequest, state, toggleLoading } = useGlobalContext();
  const { closeModal, openModal } = useModalContext();
  const showErrors = useWebResponseErrorToast();
  const { createValidationRules } = useValidationRules<ChangeCurrentUserPasswordRequest>();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [isReturningToGlobal, setIsReturningToGlobal] = useState(false);
  const changeClientModalId = useRef('');
  const changePasswordModalId = useRef('');
  const returningToGlobal = useRef(false);
  const userName = user.name || user.username;
  const initials = useMemo(() => getInitials(userName), [userName]);
  const avatarColor = useMemo(() => stringToColor(userName), [userName]);
  const canReturnToGlobal = user.isSuperuser && accessType === RequestLogAccessType.superuser;
  const menuOpen = Boolean(anchorElement);

  const fetchClientOptions = useCallback(async (): Promise<FetchOptionsResponse> => {
    const response = await getAvailableClients(locale);

    if (!response.success || !response.body) {
      showErrors(response);

      return [];
    }

    return response.body.clients;
  }, [locale, showErrors]);

  const openChangePasswordModal = () => {
    changePasswordModalId.current = openModal({
      actions: [
        { closeOnClick: true, label: tForm('cancel'), variant: 'text' },
        { form: changePasswordFormId, label: tForm('save'), type: 'submit', variant: 'contained' },
      ],
      content: (
        <FormWrapper<ChangeCurrentUserPasswordRequest>
          fields={{ currentPassword: '', newPassword: '' }}
          id={changePasswordFormId}
          onSubmit={async (values) => {
            const response = await apiRequest({
              body: values,
              endpoint: 'users/me/password',
              method: 'POST',
              onSuccess: () => closeModal(changePasswordModalId.current),
              successMessage: t('password_changed_successfully'),
            });

            return response.success;
          }}
          showPaper={false}
          sx={{ mb: 1 }}
        >
          <Box sx={{ display: 'grid', gap: '1.5rem 2rem', gridTemplateColumns: '1fr' }}>
            <FormPasswordInput<ChangeCurrentUserPasswordRequest>
              label={t('current_password')}
              name="currentPassword"
              rules={createValidationRules('required')}
            />
            <FormPasswordInput<ChangeCurrentUserPasswordRequest>
              label={t('new_password')}
              name="newPassword"
              rules={createValidationRules(['required', 'min_length[8]'])}
            />
          </Box>
        </FormWrapper>
      ),
      title: t('change_password'),
    });
  };

  const openChangeClientModal = () => {
    changeClientModalId.current = openModal({
      actions: [
        { closeOnClick: true, label: tForm('cancel'), variant: 'text' },
        { form: changeClientFormId, label: tForm('save'), type: 'submit', variant: 'contained' },
      ],
      content: (
        <FormWrapper<SwitchClientRequest>
          fields={{ clientId: client.id }}
          id={changeClientFormId}
          onSubmit={async (values) => {
            if (values.clientId === client.id) {
              closeModal(changeClientModalId.current);

              return true;
            }

            try {
              toggleLoading(true);

              const response = await switchClient(values, locale);

              if (!response.success) {
                showErrors(response);

                return false;
              }

              closeModal(changeClientModalId.current);
              router.replace('/admin');
              router.refresh();

              return true;
            } finally {
              toggleLoading(false);
            }
          }}
          showPaper={false}
          sx={{ mb: 1 }}
        >
          <FormSelect<SwitchClientRequest>
            fetchOptions={fetchClientOptions}
            label={t('change_client')}
            name="clientId"
            renderOptionLabel={(option) => formatClientOption(option)}
          />
        </FormWrapper>
      ),
      title: t('change_client'),
    });
  };

  const handleSignOut = async () => {
    try {
      toggleLoading(true);

      const response = await signOut(locale);

      if (!response.success) {
        showErrors(response);

        return;
      }

      router.replace('/auth/login');
      router.refresh();
    } finally {
      toggleLoading(false);
    }
  };

  const handleReturnToGlobal = async () => {
    if (returningToGlobal.current) {
      return;
    }

    returningToGlobal.current = true;
    setIsReturningToGlobal(true);

    try {
      toggleLoading(true);

      const response = await switchGlobal(locale);

      if (!response.success) {
        showErrors(response);

        return;
      }

      router.replace('/system-admin');
      router.refresh();
    } finally {
      returningToGlobal.current = false;
      setIsReturningToGlobal(false);
      toggleLoading(false);
    }
  };

  return (
    <Box>
      <Button
        aria-controls={menuOpen ? 'admin-user-menu' : undefined}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={t('open_user_menu')}
        id="admin-user-menu-button"
        onClick={(event) => setAnchorElement(event.currentTarget)}
        sx={{
          borderRadius: '10px',
          gap: 1.25,
          justifyContent: 'flex-start',
          minWidth: 'unset',
          px: 1,
          py: 0.5,
          textTransform: 'none',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Avatar
          sx={{
            backgroundColor: avatarColor,
            boxShadow: `0px 2px 8px -2px ${avatarColor}`,
            fontSize: '11px',
            fontWeight: 600,
            height: 28,
            width: 28,
          }}
        >
          {initials}
        </Avatar>

        <Box
          sx={{
            alignItems: 'flex-start',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            lineHeight: 1.2,
            overflow: 'hidden',
          }}
        >
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: '12.5px',
              fontWeight: 500,
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: '10.5px',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {profile.name}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        id="admin-user-menu"
        onClick={() => setTimeout(() => setAnchorElement(null), 150)}
        onClose={() => setAnchorElement(null)}
        open={menuOpen}
        slotProps={{
          list: { disablePadding: true, sx: { p: 0 } },
          paper: {
            elevation: 0,
            sx: {
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: '12px',
              boxShadow: (theme) => theme.shadows[4],
              overflow: 'hidden',
              py: 0,
              width: 280,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'action.hover',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 1.5,
            px: 2,
            py: 1.75,
          }}
        >
          <Avatar
            sx={{
              backgroundColor: avatarColor,
              fontSize: '13px',
              fontWeight: 600,
              height: 56,
              width: 56,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '11.5px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </Typography>
            <Box
              sx={{
                alignItems: 'center',
                backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
                borderRadius: '999px',
                color: 'primary.main',
                display: 'inline-flex',
                fontSize: '10px',
                fontWeight: 500,
                gap: 0.5,
                height: 18,
                mt: 0.75,
                px: 0.75,
                width: 'fit-content',
              }}
            >
              <Box
                sx={{ backgroundColor: 'primary.main', borderRadius: '50%', height: 4, width: 4 }}
              />
              {profile.name}
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 0.75 }}>
          <MenuItem
            onClick={() => router.push('/admin/profile')}
            sx={{ borderRadius: '8px', fontSize: '12.5px', gap: 1.25, height: 34, px: 1.25 }}
          >
            <User size={15} strokeWidth={2} />
            <Typography sx={{ flex: 1, fontSize: '12.5px' }}>{t('my_profile')}</Typography>
          </MenuItem>
          <MenuItem
            onClick={openChangePasswordModal}
            sx={{ borderRadius: '8px', fontSize: '12.5px', gap: 1.25, height: 34, px: 1.25 }}
          >
            <KeyRound size={15} strokeWidth={2} />
            <Typography sx={{ flex: 1, fontSize: '12.5px' }}>{t('change_password')}</Typography>
          </MenuItem>
          <MenuItem
            onClick={openChangeClientModal}
            sx={{ borderRadius: '8px', fontSize: '12.5px', gap: 1.25, height: 34, px: 1.25 }}
          >
            <Building2 size={15} strokeWidth={2} />
            <Typography sx={{ flex: 1, fontSize: '12.5px' }}>{t('change_client')}</Typography>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '10.5px',
                maxWidth: 90,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {client.name}
            </Typography>
          </MenuItem>

          {canReturnToGlobal && (
            <MenuItem
              disabled={isReturningToGlobal || state.isLoading}
              onClick={() => void handleReturnToGlobal()}
              sx={{
                borderRadius: '8px',
                color: 'primary.main',
                fontSize: '12.5px',
                gap: 1.25,
                height: 34,
                px: 1.25,
              }}
            >
              {isReturningToGlobal ? (
                <CircularProgress color="inherit" size={15} />
              ) : (
                <Landmark size={15} strokeWidth={2} />
              )}
              <Typography sx={{ flex: 1, fontSize: '12.5px' }}>
                {t(isReturningToGlobal ? 'returning_to_global_panel' : 'return_to_global_panel')}
              </Typography>
            </MenuItem>
          )}
        </Box>

        <Box sx={{ borderTop: (theme) => `1px solid ${theme.palette.divider}`, p: 0.75 }}>
          <MenuItem
            disabled={state.isLoading}
            onClick={() => void handleSignOut()}
            sx={{
              borderRadius: '8px',
              color: 'error.main',
              fontSize: '12.5px',
              gap: 1.25,
              height: 34,
              px: 1.25,
              '&:hover': { backgroundColor: (theme) => `${theme.palette.error.main}14` },
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            <Typography sx={{ fontSize: '12.5px' }}>{t('logout')}</Typography>
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
}
