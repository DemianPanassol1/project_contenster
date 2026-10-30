import type { DocumentType } from '../../../domain/documents/document-type.enum.js';

export interface SystemAdminClientListItem {
  corporateName: string;
  document: string;
  documentType: DocumentType;
  id: number;
  imageUrl: string | null;
  isActive: boolean;
  tradeName: string;
  userCount: number;
}

export interface SetSystemAdminClientActiveRequest {
  isActive: boolean;
}
