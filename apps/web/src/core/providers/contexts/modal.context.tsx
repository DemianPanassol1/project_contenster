'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { ModalRenderer } from '@/shared/feedback';

import type { ModalContextValue, ModalItem, OpenModalOptions } from './modal.types';

export const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalItem[]>([]);

  const openModal = useCallback((modal: OpenModalOptions) => {
    const id = crypto.randomUUID();

    setModals((current) => [
      ...current,
      {
        ...modal,
        fullWidth: modal.fullWidth ?? true,
        id,
        maxWidth: modal.maxWidth ?? 'sm',
        open: true,
      },
    ]);

    return id;
  }, []);

  const closeModal = useCallback((id?: string) => {
    setModals((current) => {
      const targetId = id ?? current.at(-1)?.id;

      if (!targetId) {
        return current;
      }

      return current.map((modal) => (modal.id === targetId ? { ...modal, open: false } : modal));
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((current) => {
      current.forEach((modal) => modal.onClose?.());

      return [];
    });
  }, []);

  const removeModal = useCallback((id: string) => {
    setModals((current) => current.filter((modal) => modal.id !== id));
  }, []);

  const value = useMemo(
    () => ({ closeAllModals, closeModal, modals, openModal, removeModal }),
    [closeAllModals, closeModal, modals, openModal, removeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
}

export function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider.');
  }

  return context;
}
