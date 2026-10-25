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
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {modal.title}
          </Typography>

          {!modal.disableClose && (
            <IconButton aria-label={t('close')} onClick={() => closeModal(modal.id)} size="small">
              <X size={18} />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>{modal.content}</DialogContent>

      {modal.actions && modal.actions.length > 0 && (
        <DialogActions>
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
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  ));
}
