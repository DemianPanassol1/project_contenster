const CNPJ_MAX_LENGTH = 14;
const normalizeCnpj = (value: unknown): string =>
  (typeof value === 'string' || typeof value === 'number' ? String(value) : '').replace(/\D/g, '');

export const normalizeCnpjMaskValue = (value: unknown): string => {
  const cnpj = normalizeCnpj(value);
  const base = cnpj.slice(0, 12);
  const checkDigits = cnpj.slice(12).replace(/\D/g, '').slice(0, 2);

  return `${base}${checkDigits}`.slice(0, CNPJ_MAX_LENGTH);
};

export const isCnpjMaskCharacter = (value: string): boolean => {
  return /^[A-Za-z0-9]$/.test(value);
};

export const formatCnpjMaskValue = (value: unknown): string => {
  const cnpj = normalizeCnpjMaskValue(value);

  if (cnpj.length <= 2) {
    return cnpj;
  }

  if (cnpj.length <= 5) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  }

  if (cnpj.length <= 8) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  }

  if (cnpj.length <= 12) {
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
  }

  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
};
