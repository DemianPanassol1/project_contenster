'use client';

import type { ResolvedPublicPortal } from '@contenster/shared';
import { createContext, type ReactNode, useContext } from 'react';

const PortalContext = createContext<ResolvedPublicPortal | null>(null);

interface PortalProviderProps {
  children: ReactNode;
  portal: ResolvedPublicPortal;
}

export function PortalProvider({ children, portal }: PortalProviderProps) {
  return <PortalContext.Provider value={portal}>{children}</PortalContext.Provider>;
}

export function usePortal(): ResolvedPublicPortal {
  const portal = useContext(PortalContext);

  if (!portal) throw new Error('usePortal must be used within a PortalProvider.');

  return portal;
}
