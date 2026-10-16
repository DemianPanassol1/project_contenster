import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
export interface ApiAuthenticatedSession {
  context: {
    client: {
      id: number;
    };
  };
  user: {
    id: number;
  };
}

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
  session?: ApiAuthenticatedSession;
  skipRequestLog?: boolean;
  url: string;
}

export interface ApiHttpResponse {
  getHeaders(): OutgoingHttpHeaders;
  json(body: unknown): this;
  status(statusCode: number): this;
  statusCode: number;
}
