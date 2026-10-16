import type { AuthenticatedSession } from '@contenster/shared';

declare global {
  namespace Express {
    interface Request {
      requestStartedAt?: number;
      session?: AuthenticatedSession;
      user?: AuthenticatedSession['user'];
    }
  }
}

export {};
