import {
  DocumentType,
  type GetClientByIdResponse,
  type SaveClientRequest,
} from '@contenster/shared';

import type { ClientFormValues } from '../types/client-form.types';

export const getClientDefaultValues = (): ClientFormValues => ({
  address: '',
  addressNumber: '',
  cityId: null,
  corporateName: '',
  document: '',
  documentType: DocumentType.cnpj,
  email: '',
  id: null,
  imageId: null,
  isActive: true,
  languageIds: [],
  languageLinks: [],
  neighborhood: '',
  primaryPhone: '',
  secondaryPhone: null,
  slug: '',
  tradeName: '',
  zipCode: '',
});

export const mapClientContent = (content: GetClientByIdResponse): ClientFormValues => ({
  ...content,
  languageIds: content.languageLinks.map((link) => link.languageId),
});

export const mapClientPayload = (values: ClientFormValues): SaveClientRequest => {
  const linkIdByLanguageId = new Map(
    values.languageLinks.map((link) => [link.languageId, link.id]),
  );
  const { languageIds, languageLinks: _languageLinks, ...client } = values;

  return {
    ...client,
    languageLinks: languageIds.map((languageId) => ({
      id: linkIdByLanguageId.get(languageId) ?? null,
      languageId,
    })),
  };
};

export const getDocumentValidationRules = (documentType: DocumentType): string => {
  if (documentType === DocumentType.cpf) return 'required|cpf|max_length[30]';
  if (documentType === DocumentType.cnpj) return 'required|cnpj|max_length[30]';

  return 'required|max_length[30]';
};
