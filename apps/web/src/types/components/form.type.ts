import { type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form';

export interface BaseFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
}

export type PhoneCountry = 'BR' | 'US' | 'ES';
export type MaskType =
  'cpf' | 'cnpj' | 'rg' | 'caepf' | 'phone' | 'cep' | 'currency' | 'percentage';

export type UploadedFile = UploadFieldFile;

export interface UploadFieldFile {
  id: number;
  originalName: string;
  url?: string | null;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
}
