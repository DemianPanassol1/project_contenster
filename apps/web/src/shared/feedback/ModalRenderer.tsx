'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useModalContext } from '@/core/providers/contexts/modal.context';
import { portalFontSize } from '@/core/theme';

export function ModalRenderer() {
  const t = useTranslations('protected.modal');
  const { closeModal, modals, removeModal } = useModalContext();

  return modals.map((modal) => (
    <Dialog
      fullWidth={modal.fullWidth}
      key={modal.id}
      maxWidth={modal.maxWidth}
      onClose={(_, reason) => {
        if (!modal.disableClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
          closeModal(modal.id);
        }
      }}
      open={modal.open}
      slotProps={{
        transition: {
          onExited: () => removeModal(modal.id),
        },
      }}
    >
      <DialogTitle sx={{ px: 2, py: 1.25 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            component="span"
            sx={{ fontSize: portalFontSize(18), fontWeight: 600, lineHeight: 1.3 }}
          >
            {modal.title}
          </Typography>

          {!modal.disableClose && (
            <IconButton aria-label={t('close')} onClick={() => closeModal(modal.id)} size="small">
              <X size={18} />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: 2,
          py: 1.5,
          '& .MuiInputBase-input': { fontSize: portalFontSize(14) },
          '& .MuiInputLabel-root': { fontSize: portalFontSize(13) },
        }}
      >
        {modal.content}
      </DialogContent>

      {modal.actions && modal.actions.length > 0 && (
        <DialogActions sx={{ gap: 0.5, px: 1.25, py: 1.25 }}>
          {modal.actions.map((action) => (
            <Button
              color={action.color ?? 'primary'}
              disabled={action.disabled}
              form={action.form}
              key={action.label}
              onClick={async () => {
                await action.onClick?.();

                if (action.closeOnClick) {
                  closeModal(modal.id);
                }
              }}
              type={action.type ?? 'button'}
              variant={action.variant ?? 'text'}
              sx={{ fontSize: portalFontSize(13), minHeight: 34, px: 1.5 }}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  ));
}
