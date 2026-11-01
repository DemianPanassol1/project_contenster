import type { RequestLogAccessType } from '@contenster/shared';

export interface SessionSnapshot {
  accessType: RequestLogAccessType;
  clientId: number | null;
  eventType: string | null;
  userId: number | null;
}
