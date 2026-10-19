import type { DocumentType } from '../../../domain/documents/document-type.enum.js';

export interface SaveClientRequest {
  id: number | null;
  corporateName: string;
  tradeName: string;
  document: string;
  documentType: DocumentType;
  email: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  address: string;
  addressNumber: string;
  zipCode: string;
  neighborhood: string;
  slug: string;
  cityId: number | null;
  imageId: number | null;
  isActive: boolean;
  languageIds: number[];
}

export interface ClientListItem {
  id: number;
  corporateName: string;
  tradeName: string;
  document: string;
  isActive: boolean;
}

export interface GetClientByIdResponse extends ClientListItem {
  documentType: DocumentType;
  email: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  address: string;
  addressNumber: string;
  zipCode: string;
  neighborhood: string;
  slug: string;
  cityId: number | null;
  imageId: number | null;
  languageIds: number[];
}
