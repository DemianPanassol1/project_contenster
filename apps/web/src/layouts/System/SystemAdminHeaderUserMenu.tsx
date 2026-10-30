'use client';

import type { SessionUser } from '@contenster/shared';
import { Avatar, Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { Building2, LogOut } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useGlobalContext, useModalContext } from '@/core/providers';
import { useValidationRules, useWebResponseErrorToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { getSystemAdminClientOptions, signOut, switchClientAsSuperuser } from '@/services/actions';
import type { FetchOptionsResponse } from '@/services/hooks';
import { FormSelect, FormWrapper } from '@/shared/form';
import { FormatUtils } from '@/utils';

interface SystemAdminHeaderUserMenuProps {
  user: SessionUser;
}

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

const accessClientContextFormId = 'system-admin-access-client-context-form';

interface AccessClientContextFormValues {
  clientId: number | null;
}

const formatClientOption = (option: {
  label: string;
  metadata?: Record<string, unknown> | null;
}): string => {
  const document = option.metadata?.document;
  const documentType = option.metadata?.documentType;
  const formattedDocument =
    typeof document === 'string'
      ? FormatUtils.formatDocument(document, typeof documentType === 'string' ? documentType : null)
      : '';

  return formattedDocument ? `${option.label} (${formattedDocument})` : option.label;
};

export function SystemAdminHeaderUserMenu({ user }: SystemAdminHeaderUserMenuProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('global');
  const tForm = useTranslations('form');
  const { state, toggleLoading } = useGlobalContext();
  const { closeModal, openModal } = useModalContext();
  const showErrors = useWebResponseErrorToast();
  const { createValidationRules } = useValidationRules<AccessClientContextFormValues>();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const accessClientContextModalId = useRef('');
  const userName = user.name || user.username;
  const initials = useMemo(() => getInitials(userName), [userName]);
  const avatarColor = useMemo(() => stringToColor(userName), [userName]);
  const menuOpen = Boolean(anchorElement);

  const fetchClientOptions = useCallback(async (): Promise<FetchOptionsResponse> => {
    return getSystemAdminClientOptions(locale);
  }, [locale]);

  const openAccessClientContextModal = () => {
    accessClientContextModalId.current = openModal({
      actions: [
        { closeOnClick: true, label: tForm('cancel'), variant: 'text' },
        {
          form: accessClientContextFormId,
          label: t('access_client_context'),
          type: 'submit',
          variant: 'contained',
        },
      ],
      content: (
        <FormWrapper<AccessClientContextFormValues>
          fields={{ clientId: null }}
          id={accessClientContextFormId}
          onSubmit={async (values) => {
            try {
              toggleLoading(true);

              if (values.clientId === null) {
                return false;
              }

              const response = await switchClientAsSuperuser({ clientId: values.clientId }, locale);

              if (!response.success) {
                showErrors(response);

                return false;
              }

              closeModal(accessClientContextModalId.current);
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
          <FormSelect<AccessClientContextFormValues>
            fetchOptions={fetchClientOptions}
            label={t('access_client_context')}
            name="clientId"
            renderOptionLabel={formatClientOption}
            rules={createValidationRules('required')}
          />
        </FormWrapper>
      ),
      title: t('access_client_context'),
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

  return (
    <Box>
      <Button
        aria-controls={menuOpen ? 'system-admin-user-menu' : undefined}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={t('open_user_menu')}
        id="system-admin-user-menu-button"
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
          src={user.imageUrl ?? undefined}
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
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userName}
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '10.5px',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t('superuser')}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        id="system-admin-user-menu"
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
            src={user.imageUrl ?? undefined}
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
              {userName}
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
              {t('superuser')}
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 0.75 }}>
          <MenuItem
            disabled={state.isLoading}
            onClick={openAccessClientContextModal}
            sx={{ borderRadius: '8px', fontSize: '12.5px', gap: 1.25, height: 34, px: 1.25 }}
          >
            <Building2 size={15} strokeWidth={2} />
            <Typography sx={{ flex: 1, fontSize: '12.5px' }}>
              {t('access_client_context')}
            </Typography>
          </MenuItem>
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
