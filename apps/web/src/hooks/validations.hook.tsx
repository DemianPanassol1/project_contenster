'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { type FieldValues, type RegisterOptions } from 'react-hook-form';

import {
  regexAlpha,
  regexAlphaDash,
  regexAlphaNumeric,
  regexAlphaNumericSpaces,
  regexDecimal,
  regexInteger,
  regexNumeric,
  regexSimpleEmail,
  regexUUID,
  toDisplayText,
} from '@/utils';

type ValidationRuleName =
  | 'required'
  | 'email'
  | 'min_length'
  | 'max_length'
  | 'exact_length'
  | 'numeric'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'url'
  | 'uuid'
  | 'cpf'
  | 'cnpj'
  | 'phone'
  | 'cep'
  | 'date'
  | 'datetime'
  | 'json'
  | 'alpha'
  | 'alpha_numeric'
  | 'alpha_numeric_spaces'
  | 'alpha_dash'
  | 'greater_than'
  | 'greater_than_equal_to'
  | 'less_than'
  | 'less_than_equal_to'
  | 'regex'
  | 'in'
  | 'not_in'
  | 'accepted';

interface ParsedValidationRule {
  name: string;
  parameter?: string;
}

type ValidationFunction = (value: unknown) => true | string;

type ValidationRules<T extends FieldValues> = RegisterOptions<T> & {
  validate?: Record<string, ValidationFunction>;
};

type CreateValidationRules<T extends FieldValues> = (
  rules: string | string[],
) => RegisterOptions<T>;

export const useValidationRules = <T extends FieldValues = FieldValues>() => {
  const t = useTranslations('validations');

  const createValidationRules = useCallback<CreateValidationRules<T>>(
    (rules) => {
      const parsedRules = normalizeRules(rules);
      const validationRules: ValidationRules<T> = {};

      for (const rule of parsedRules) {
        const ruleName = rule.name as ValidationRuleName;

        switch (ruleName) {
          case 'required':
            validationRules.required = t('required');
            break;

          case 'min_length':
            addLengthRule(validationRules, 'minLength', rule.parameter, (value) =>
              t('minLength', { value: String(value) }),
            );
            break;

          case 'max_length':
            addLengthRule(validationRules, 'maxLength', rule.parameter, (value) =>
              t('maxLength', { value: String(value) }),
            );
            break;

          case 'exact_length':
            addExactLengthRule(validationRules, rule.parameter, (value) =>
              t('exactLength', { value: String(value) }),
            );
            break;

          case 'email':
            addPatternRule(validationRules, 'email', regexSimpleEmail, t('email'));
            break;

          case 'url':
            addValidateRule(validationRules, 'url', (value) =>
              isEmptyValue(value) || isValidUrl(value) ? true : t('url'),
            );
            break;

          case 'uuid':
            addPatternRule(validationRules, 'uuid', regexUUID, t('uuid'));
            break;

          case 'numeric':
            addPatternRule(validationRules, 'numeric', regexNumeric, t('numeric'));
            break;

          case 'integer':
            addPatternRule(validationRules, 'integer', regexInteger, t('integer'));
            break;

          case 'decimal':
            addPatternRule(validationRules, 'decimal', regexDecimal, t('decimal'));
            break;

          case 'boolean':
            addValidateRule(validationRules, 'boolean', (value) =>
              isEmptyValue(value) || isBooleanLike(value) ? true : t('boolean'),
            );
            break;

          case 'cpf':
            addValidateRule(validationRules, 'cpf', (value) =>
              isEmptyValue(value) || isValidCpf(value) ? true : t('cpf'),
            );
            break;

          case 'cnpj':
            addValidateRule(validationRules, 'cnpj', (value) =>
              isEmptyValue(value) || isValidCnpj(value) ? true : t('cnpj'),
            );
            break;

          case 'phone':
            addValidateRule(validationRules, 'phone', (value) =>
              isEmptyValue(value) || isValidPhone(value) ? true : t('phone'),
            );
            break;

          case 'cep':
            addValidateRule(validationRules, 'cep', (value) =>
              isEmptyValue(value) || onlyDigits(value).length === 8 ? true : t('cep'),
            );
            break;

          case 'date':
            addValidateRule(validationRules, 'date', (value) =>
              isEmptyValue(value) || isValidDate(value) ? true : t('date'),
            );
            break;

          case 'datetime':
            addValidateRule(validationRules, 'datetime', (value) =>
              isEmptyValue(value) || isValidDateTime(value) ? true : t('datetime'),
            );
            break;

          case 'json':
            addValidateRule(validationRules, 'json', (value) =>
              isEmptyValue(value) || isValidJson(value) ? true : t('json'),
            );
            break;

          case 'alpha':
            addPatternRule(validationRules, 'alpha', regexAlpha, t('alpha'));
            break;

          case 'alpha_numeric':
            addPatternRule(validationRules, 'alphaNumeric', regexAlphaNumeric, t('alphaNumeric'));
            break;

          case 'alpha_numeric_spaces':
            addPatternRule(
              validationRules,
              'alphaNumericSpaces',
              regexAlphaNumericSpaces,
              t('alphaNumericSpaces'),
            );
            break;

          case 'alpha_dash':
            addPatternRule(validationRules, 'alphaDash', regexAlphaDash, t('alphaDash'));
            break;

          case 'greater_than':
            addNumberComparisonRule(validationRules, rule.parameter, 'greaterThan', (value) =>
              t('greaterThan', { value: String(value) }),
            );
            break;

          case 'greater_than_equal_to':
            addNumberComparisonRule(
              validationRules,
              rule.parameter,
              'greaterThanEqualTo',
              (value) => t('greaterThanEqualTo', { value: String(value) }),
            );
            break;

          case 'less_than':
            addNumberComparisonRule(validationRules, rule.parameter, 'lessThan', (value) =>
              t('lessThan', { value: String(value) }),
            );
            break;

          case 'less_than_equal_to':
            addNumberComparisonRule(validationRules, rule.parameter, 'lessThanEqualTo', (value) =>
              t('lessThanEqualTo', { value: String(value) }),
            );
            break;

          case 'regex':
            addRegexRule(validationRules, rule.parameter, t('regex'));
            break;

          case 'in':
            addInRule(validationRules, rule.parameter, 'in', t('in'));
            break;

          case 'not_in':
            addInRule(validationRules, rule.parameter, 'notIn', t('notIn'));
            break;

          case 'accepted':
            addValidateRule(validationRules, 'accepted', (value) =>
              isAccepted(value) ? true : t('accepted'),
            );
            break;

          default:
            warnUnknownRule(rule.name);
            break;
        }
      }

      return validationRules;
    },
    [t],
  );

  return { createValidationRules };
};

const normalizeRules = (rules: string | string[]): ParsedValidationRule[] => {
  const ruleList = Array.isArray(rules) ? rules : splitRules(rules);

  return ruleList.flatMap(splitRules).map(parseRule).filter(isParsedValidationRule);
};

const isParsedValidationRule = (rule: ParsedValidationRule | null): rule is ParsedValidationRule =>
  Boolean(rule);

const splitRules = (rules: string): string[] => {
  const result: string[] = [];
  let current = '';
  let bracketDepth = 0;

  for (const character of rules) {
    if (character === '[') bracketDepth += 1;
    if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (character === '|' && bracketDepth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  if (current.trim()) result.push(current.trim());

  return result;
};

const parseRule = (rule: string): ParsedValidationRule | null => {
  const match = rule.match(/^([a-z_]+)(?:\[(.*)\])?$/);

  if (!match) {
    warnUnknownRule(rule);
    return null;
  }

  return {
    name: match[1],
    parameter: match[2],
  };
};

const addLengthRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  key: 'minLength' | 'maxLength',
  parameter: string | undefined,
  getMessage: (value: number) => string,
) => {
  const value = parseIntegerParameter(parameter);

  if (value === null) return;

  rules[key] = { value, message: getMessage(value) };
};

const addExactLengthRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  parameter: string | undefined,
  getMessage: (value: number) => string,
) => {
  const value = parseIntegerParameter(parameter);

  if (value === null) return;

  const message = getMessage(value);

  rules.minLength = { value, message };
  rules.maxLength = { value, message };
};

const addPatternRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  key: string,
  pattern: RegExp,
  message: string,
) => {
  if (!rules.pattern) {
    rules.pattern = {
      value: pattern,
      message,
    };

    return;
  }

  addValidateRule(rules, key, (value) =>
    isEmptyValue(value) || pattern.test(String(value)) ? true : message,
  );
};

const addRegexRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  parameter: string | undefined,
  message: string,
) => {
  const pattern = parseRegExpParameter(parameter);

  if (!pattern) return;

  addPatternRule(rules, 'regex', pattern, message);
};

const addNumberComparisonRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  parameter: string | undefined,
  comparison: 'greaterThan' | 'greaterThanEqualTo' | 'lessThan' | 'lessThanEqualTo',
  getMessage: (value: number) => string,
) => {
  const limit = parseNumberParameter(parameter);

  if (limit === null) return;

  const message = getMessage(limit);

  addValidateRule(rules, comparison, (value) => {
    if (isEmptyValue(value)) return true;

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) return message;

    switch (comparison) {
      case 'greaterThan':
        return parsedValue > limit ? true : message;
      case 'greaterThanEqualTo':
        return parsedValue >= limit ? true : message;
      case 'lessThan':
        return parsedValue < limit ? true : message;
      case 'lessThanEqualTo':
        return parsedValue <= limit ? true : message;
      default:
        return true;
    }
  });
};

const addInRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  parameter: string | undefined,
  key: 'in' | 'notIn',
  message: string,
) => {
  const values = parseListParameter(parameter);

  if (!values.length) return;

  addValidateRule(rules, key, (value) => {
    if (isEmptyValue(value)) return true;

    const stringValue = String(value);
    const includesValue = values.includes(stringValue);

    return key === 'in' ? (includesValue ? true : message) : !includesValue ? true : message;
  });
};

const addValidateRule = <T extends FieldValues>(
  rules: ValidationRules<T>,
  key: string,
  validate: ValidationFunction,
) => {
  rules.validate = {
    ...(typeof rules.validate === 'object' ? rules.validate : {}),
    [key]: validate,
  };
};

const parseIntegerParameter = (parameter: string | undefined): number | null => {
  const parsed = Number(parameter);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const parseNumberParameter = (parameter: string | undefined): number | null => {
  const parsed = Number(parameter);

  return Number.isFinite(parsed) ? parsed : null;
};

const parseListParameter = (parameter: string | undefined): string[] => {
  if (!parameter) return [];

  return parameter
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseRegExpParameter = (parameter: string | undefined): RegExp | null => {
  if (!parameter) return null;

  try {
    const match = parameter.match(/^\/(.+)\/([a-z]*)$/i);

    if (match) {
      return new RegExp(match[1], match[2]);
    }

    return new RegExp(parameter);
  } catch {
    return null;
  }
};

const isEmptyValue = (value: unknown): boolean => {
  return value === null || value === undefined || value === '';
};

const onlyDigits = (value: unknown): string => {
  return toDisplayText(value).replace(/\D/g, '');
};

const isValidCnpj = (value: unknown): boolean => {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calculateDigit = (digits: string): number => {
    const weights =
      digits.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = digits
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(cnpj.slice(0, 12));
  const secondDigit = calculateDigit(`${cnpj.slice(0, 12)}${firstDigit}`);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
};

const isBooleanLike = (value: unknown): boolean => {
  return (
    typeof value === 'boolean' ||
    value === 'true' ||
    value === 'false' ||
    value === '1' ||
    value === '0'
  );
};

const isValidUrl = (value: unknown): boolean => {
  try {
    const url = new URL(String(value));

    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
};

const isValidPhone = (value: unknown): boolean => {
  const digits = onlyDigits(value);

  return digits.length >= 10 && digits.length <= 15;
};

const isValidDate = (value: unknown): boolean => {
  const text = String(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;

  const date = new Date(`${text}T00:00:00`);

  return !Number.isNaN(date.getTime());
};

const isValidDateTime = (value: unknown): boolean => {
  return !Number.isNaN(new Date(String(value)).getTime());
};

const isValidJson = (value: unknown): boolean => {
  try {
    JSON.parse(String(value));
    return true;
  } catch {
    return false;
  }
};

const isAccepted = (value: unknown): boolean => {
  return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
};

const isValidCpf = (value: unknown): boolean => {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const firstDigit = calculateCpfDigit(cpf.slice(0, 9));
  const secondDigit = calculateCpfDigit(`${cpf.slice(0, 9)}${firstDigit}`);

  return cpf === `${cpf.slice(0, 9)}${firstDigit}${secondDigit}`;
};

const calculateCpfDigit = (value: string): number => {
  const sum = value
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (value.length + 1 - index), 0);
  const remainder = (sum * 10) % 11;

  return remainder === 10 ? 0 : remainder;
};

const warnUnknownRule = (rule: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Unknown validation rule: ${rule}`);
  }
};
