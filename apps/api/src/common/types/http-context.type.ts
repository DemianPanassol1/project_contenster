import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';

export interface ApiHttpRequest {
  body?: unknown;
  headers: IncomingHttpHeaders;
  ip?: string;
  method: string;
  originalUrl?: string;
  query?: Record<string, unknown>;
  requestId?: string;
  requestStartedAt?: number;
  skipRequestLog?: boolean;
  url: string;
}

export interface ApiHttpResponse {
  getHeaders(): OutgoingHttpHeaders;
  json(body: unknown): this;
  status(statusCode: number): this;
  statusCode: number;
}
