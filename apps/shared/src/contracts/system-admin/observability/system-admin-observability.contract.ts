import type { RequestLogAccessType } from '../../../domain/logging/request-log-access-type.enum.js';
import type {
  RequestLogDetail,
  RequestLogListItem,
} from '../../observability/client-logs/client-logs.contract.js';

export interface SystemAdminRequestLogListItem extends RequestLogListItem {
  accessType: RequestLogAccessType;
  clientName: string | null;
}

export interface SystemAdminRequestLogDetail
  extends RequestLogDetail, SystemAdminRequestLogListItem {}
