export enum DocumentType {
  cpf = 'cpf',
  cnpj = 'cnpj',
  rg = 'rg',
  caepf = 'caepf',
}

export const documentTypeDictionary = {
  [DocumentType.cpf]: 'enums.document_type.cpf',
  [DocumentType.cnpj]: 'enums.document_type.cnpj',
  [DocumentType.rg]: 'enums.document_type.rg',
  [DocumentType.caepf]: 'enums.document_type.caepf',
} as const satisfies Record<DocumentType, string>;
