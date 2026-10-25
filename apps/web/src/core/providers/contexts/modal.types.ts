import type { DialogProps } from '@mui/material';
import type { ReactNode } from 'react';

export interface ModalAction {
  closeOnClick?: boolean;
  color?: 'error' | 'info' | 'primary' | 'success' | 'warning';
  disabled?: boolean;
  form?: string;
  label: string;
  onClick?: () => Promise<void> | void;
  type?: 'button' | 'reset' | 'submit';
  variant?: 'contained' | 'outlined' | 'text';
}

export interface ModalItem {
  actions?: ModalAction[];
  content: ReactNode;
  disableClose?: boolean;
  fullWidth?: boolean;
  id: string;
  maxWidth?: DialogProps['maxWidth'];
  onClose?: () => void;
  open: boolean;
  title: string;
}

export interface ModalContextValue {
  closeAllModals: () => void;
  closeModal: (id?: string) => void;
  modals: ModalItem[];
  openModal: (modal: OpenModalOptions) => string;
  removeModal: (id: string) => void;
}

export type OpenModalOptions = Omit<ModalItem, 'id' | 'open'>;
