import type { AuthenticatedSession } from '@contenster/shared';

export interface StoredSession {
  expiresAt: string;
  staySignedIn: boolean;
  session: AuthenticatedSession;
}
