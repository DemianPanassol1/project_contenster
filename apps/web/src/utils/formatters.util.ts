import { parsePhoneNumberFromString } from 'libphonenumber-js';

const onlyDigits = (value: string): string => value.replace(/\D/g, '');
const normalizeCnpj = (value: unknown): string =>
  onlyDigits(typeof value === 'string' || typeof value === 'number' ? String(value) : '').slice(
    0,
    14,
  );

export const toDisplayText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Date) return value.toLocaleString();

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const label = record.label ?? record.name ?? record.originalName ?? record.value;

    if (
      typeof label === 'string' ||
      typeof label === 'number' ||
      typeof label === 'boolean' ||
      typeof label === 'bigint'
    ) {
      return label.toString();
    }
  }

  return '';
};

export const FormatUtils = {
  formatFileSize(sizeInBytes: number | null | undefined, locale: string): string {
    if (
      sizeInBytes === null ||
      sizeInBytes === undefined ||
      !Number.isFinite(sizeInBytes) ||
      sizeInBytes < 0
    ) {
      return '';
    }

    if (sizeInBytes < 1024) {
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(sizeInBytes)} B`;
    }

    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;
    const { unit, value } =
      sizeInBytes < megabyte
        ? { unit: 'KB', value: sizeInBytes / kilobyte }
        : sizeInBytes < gigabyte
          ? { unit: 'MB', value: sizeInBytes / megabyte }
          : { unit: 'GB', value: sizeInBytes / gigabyte };

    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)} ${unit}`;
  },

  formatDocument(document: string, documentType?: string | null): string {
    const cleaned = onlyDigits(document);
    const normalizedCnpj = normalizeCnpj(document);

    if (documentType === 'cpf') return this.formatCPF(cleaned);
    if (documentType === 'cnpj') return this.formatCNPJ(document);
    if (documentType === 'caepf') return this.formatCAEPF(cleaned);
    if (documentType === 'rg') return this.formatRG(cleaned);
    if (cleaned.length === 11) return this.formatCPF(cleaned);
    if (normalizedCnpj.length === 14) return this.formatCNPJ(normalizedCnpj);

    return document;
  },

  formatCNPJ(cnpj: string): string {
    const cleaned = normalizeCnpj(cnpj);
    if (cleaned.length !== 14) return toDisplayText(cnpj);

    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  },

  formatCPF(cpf: string): string {
    const cleaned = onlyDigits(cpf);
    if (cleaned.length !== 11) return '';

    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  },

  formatCAEPF(caepf: string): string {
    const cleaned = onlyDigits(caepf);
    if (cleaned.length !== 14) return '';

    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  },

  formatCEP(cep: string): string {
    const cleaned = onlyDigits(cep);
    if (cleaned.length !== 8) return '';

    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  },

  formatRG(rg: string): string {
    const cleaned = onlyDigits(rg);
    if (cleaned.length < 5 || cleaned.length > 9) return '';

    return cleaned.length === 9
      ? `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}-${cleaned.slice(8)}`
      : `${cleaned.slice(0, 1)}.${cleaned.slice(1, 4)}.${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  },

  formatPhone(phone: string): string {
    const cleaned = phone?.replace(/\D/g, '') ?? '';
    if (!cleaned) return '';

    const originalPhone = phone?.trim() ?? '';
    const formatInternationalPhone = (value: string): string => {
      const phoneNumber = parsePhoneNumberFromString(value);

      return phoneNumber?.isValid() ? phoneNumber.formatInternational() : '';
    };

    if (originalPhone.startsWith('+')) {
      return formatInternationalPhone(`+${cleaned}`);
    }

    if (cleaned.length === 10 || cleaned.length === 11) {
      const brazilianPhone = parsePhoneNumberFromString(cleaned, 'BR');

      if (brazilianPhone?.isValid()) {
        return brazilianPhone.formatNational();
      }
    }

    if (cleaned.length >= 10) {
      return formatInternationalPhone(`+${cleaned}`);
    }

    return '';
  },

  formatDate(date: Date | string, locale: string = 'pt-BR'): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';

    return parsed.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  formatMoney(
    value: number | string | null | undefined,
    locale: string = 'pt-BR',
    currency: string = 'BRL',
  ): string {
    const numericValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim() !== ''
          ? Number(value)
          : Number.NaN;

    if (!Number.isFinite(numericValue)) return '';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  },

  unformat(value: string): string {
    return onlyDigits(value);
  },
};
