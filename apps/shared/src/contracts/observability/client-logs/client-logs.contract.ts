import type { CronExecutionStatus } from '../../../domain/logging/cron-execution-status.enum.js';
import type { RequestLogLevel } from '../../../domain/logging/request-log-level.enum.js';

export type LogPayload =
  boolean | null | number | string | LogPayload[] | { [key: string]: LogPayload };

export interface RequestLogListItem {
  clientId: number | null;
  createdAt: string;
  id: number;
  ip: string | null;
  level: RequestLogLevel;
  method: string;
  responseTimeMs: number;
  route: string;
  statusCode: number;
  userName: string | null;
}

export interface RequestLogDetail extends RequestLogListItem {
  error: LogPayload;
  eventType: string | null;
  queryParams: LogPayload;
  requestBody: LogPayload;
  requestHeaders: LogPayload;
  requestId: string;
  responseBody: LogPayload;
  responseHeaders: LogPayload;
  responseTimeDescription: string;
  userAgent: string | null;
}

export interface CronExecutionLogListItem {
  createdAt: string;
  durationMs: number | null;
  id: number;
  message: string | null;
  status: CronExecutionStatus;
  taskName: string;
  totalError: number | null;
  totalProcessed: number | null;
  totalSuccess: number | null;
}

export interface CronExecutionLogDetail extends CronExecutionLogListItem {
  error: LogPayload;
  finishedAt: string | null;
  startedAt: string;
}
