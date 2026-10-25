import { type DialogProps } from '@mui/material';
import { type ReactNode } from 'react';

import { type icons } from '@/shared';

export interface ModalAction {
  label: string;
  icon?: keyof typeof icons;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info';
  disabled?: boolean;
  closeOnClick?: boolean;
  onClick?: () => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}

export interface ModalItem {
  id: string;
  title: string;
  content: ReactNode;
  open: boolean;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  actions?: ModalAction[];
  disableClose?: boolean;
  onClose?: () => void;
}

export interface ModalContextValue {
  modals: ModalItem[];
  openModal: (modal: OpenModalOptions) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  removeModal: (id: string) => void;
}

export type OpenModalOptions = Omit<ModalItem, 'id' | 'open'>;
