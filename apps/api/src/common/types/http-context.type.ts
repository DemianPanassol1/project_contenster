import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
import type { AuthenticatedSession } from '@contenster/shared';

export interface ApiRequestLogAuditMetadata {
  clientId?: number | null;
  eventType?: string | null;
}

export interface ApiHttpRequest {
  body?: unknown;
  headers: IncomingHttpHeaders;
  ip?: string;
  method: string;
  originalUrl?: string;
  query?: Record<string, unknown>;
  requestLogAudit?: ApiRequestLogAuditMetadata;
  requestId?: string;
  requestStartedAt?: number;
  session?: AuthenticatedSession;
  skipRequestLog?: boolean;
  url: string;
}

export interface ApiHttpResponse {
  getHeaders(): OutgoingHttpHeaders;
  json(body: unknown): this;
  status(statusCode: number): this;
  statusCode: number;
}
