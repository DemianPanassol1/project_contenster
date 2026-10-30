'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getSessionFingerprint } from '@/services/actions';

const ACTIVITY_THROTTLE_MS = 1_000;
const IDLE_REVALIDATION_MS = 60_000;

interface SessionRevalidationContextValue {
  requestSessionRevalidation: () => Promise<void>;
}

interface AuthenticatedSessionRevalidatorProps {
  children: ReactNode;
  initialFingerprint: string;
  locale: Locale;
}

const SessionRevalidationContext = createContext<SessionRevalidationContextValue | null>(null);

export function AuthenticatedSessionRevalidator({
  children,
  initialFingerprint,
  locale,
}: AuthenticatedSessionRevalidatorProps) {
  const router = useRouter();
  const fingerprint = useRef<string | null>(initialFingerprint);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revalidationPromise = useRef<Promise<void> | null>(null);
  const lastActivityAt = useRef<number | null>(null);

  useEffect(() => {
    fingerprint.current = initialFingerprint;
  }, [initialFingerprint]);

  const revalidateSession = useCallback((): Promise<void> => {
    if (revalidationPromise.current) {
      return revalidationPromise.current;
    }

    const revalidation = (async () => {
      try {
        const nextFingerprint = await getSessionFingerprint(locale);

        if (nextFingerprint !== fingerprint.current) {
          fingerprint.current = nextFingerprint;
          router.refresh();
        }
      } catch {
        // Connectivity failures are retried on the next user, visibility, or idle event.
      }
    })();

    revalidationPromise.current = revalidation;

    void revalidation.finally(() => {
      if (revalidationPromise.current === revalidation) {
        revalidationPromise.current = null;
      }
    });

    return revalidation;
  }, [locale, router]);

  useEffect(() => {
    const clearIdleTimer = () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    };

    function scheduleIdleRevalidation() {
      clearIdleTimer();

      if (document.visibilityState !== 'visible') {
        return;
      }

      idleTimer.current = setTimeout(() => {
        void revalidateSession().finally(scheduleIdleRevalidation);
      }, IDLE_REVALIDATION_MS);
    }

    const registerActivity = () => {
      const now = Date.now();

      if (lastActivityAt.current !== null && now - lastActivityAt.current < ACTIVITY_THROTTLE_MS) {
        return;
      }

      lastActivityAt.current = now;
      scheduleIdleRevalidation();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        clearIdleTimer();
        return;
      }

      lastActivityAt.current = Date.now();
      void revalidateSession();
      scheduleIdleRevalidation();
    };

    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        void revalidateSession();
        scheduleIdleRevalidation();
      }
    };

    const onOnline = () => {
      if (document.visibilityState === 'visible') {
        void revalidateSession();
        scheduleIdleRevalidation();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'keydown',
      'pointerdown',
      'pointermove',
      'scroll',
      'touchstart',
    ];

    lastActivityAt.current = Date.now();
    scheduleIdleRevalidation();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    activityEvents.forEach((eventName) => window.addEventListener(eventName, registerActivity));

    return () => {
      clearIdleTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, registerActivity),
      );
    };
  }, [revalidateSession]);

  const value = useMemo<SessionRevalidationContextValue>(
    () => ({ requestSessionRevalidation: revalidateSession }),
    [revalidateSession],
  );

  return (
    <SessionRevalidationContext.Provider value={value}>
      {children}
    </SessionRevalidationContext.Provider>
  );
}

export const useOptionalSessionRevalidation = (): SessionRevalidationContextValue | null =>
  useContext(SessionRevalidationContext);
