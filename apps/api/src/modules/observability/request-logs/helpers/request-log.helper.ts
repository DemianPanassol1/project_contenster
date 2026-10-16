import { type ApiHttpRequest } from '@/common/types/http-context.type';
import type { ApiResponse } from '@/shared/responses/api-response.types';

import type { SessionSnapshot } from '../types/session-snapshot.type';

export const getUserAgent = (request: ApiHttpRequest): string | null => {
  const userAgentHeader: unknown = request.headers['user-agent'];

  if (Array.isArray(userAgentHeader)) {
    const firstUserAgent = userAgentHeader.find((item): item is string => typeof item === 'string');

    return firstUserAgent ?? null;
  }

  return typeof userAgentHeader === 'string' ? userAgentHeader : null;
};

export const createSessionSnapshot = (request: ApiHttpRequest): SessionSnapshot => {
  const session = request.session;
  const audit = request.requestLogAudit;

  return {
    clientId: audit?.clientId ?? session?.context.client.id ?? null,
    eventType: audit?.eventType ?? null,
    userId: session?.user.id ?? null,
  };
};

export const getResponseRequestId = (body: unknown): string | null => {
  if (!body || typeof body !== 'object') return null;

  const response = body as Partial<ApiResponse>;

  return typeof response.requestId === 'string' ? response.requestId : null;
};
