import { DEFAULT_API_LOCALE } from '@/i18n/i18n.config';

const quoteIdentifier = (value: string): string => `"${value.replaceAll('"', '""')}"`;
const tableName = (table: string): string => quoteIdentifier(table);

const normalizeSqlReference = (expression: string): string => {
  const reference = /^([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)$/.exec(expression);

  return reference
    ? `${quoteIdentifier(reference[1])}.${quoteIdentifier(reference[2])}`
    : expression;
};

type TranslatedFieldExpressionOptions = {
  fallbackExpression?: string;
  fieldColumn: string;
  ownerColumn: string;
  ownerExpression: string;
  table: string;
  uniqueAlias: string;
};

const translationSubquery = (
  options: TranslatedFieldExpressionOptions,
  languageParameterName: 'currentLanguage' | 'fallbackLanguage',
): string => {
  const translationAlias = quoteIdentifier(`${options.uniqueAlias}_${languageParameterName}`);
  const languageAlias = quoteIdentifier(`${options.uniqueAlias}_${languageParameterName}_language`);

  return `(
    SELECT ${translationAlias}.${quoteIdentifier(options.fieldColumn)}
    FROM ${tableName(options.table)} ${translationAlias}
    INNER JOIN ${tableName('idiomas')} ${languageAlias}
      ON ${languageAlias}."id" = ${translationAlias}."idioma_id"
    WHERE ${translationAlias}.${quoteIdentifier(options.ownerColumn)} = ${normalizeSqlReference(options.ownerExpression)}
      AND ${languageAlias}."codigo_idioma" = :${languageParameterName}
    LIMIT 1
  )`;
};

export const buildTranslatedFieldExpression = (
  options: TranslatedFieldExpressionOptions,
): string => {
  const expressions = [
    translationSubquery(options, 'currentLanguage'),
    translationSubquery(options, 'fallbackLanguage'),
  ];

  if (options.fallbackExpression) {
    expressions.push(options.fallbackExpression);
  }

  return `COALESCE(${expressions.join(', ')})`;
};

export const buildTranslationQueryParameters = (languageCode?: string | null) => ({
  currentLanguage: languageCode?.trim().toLowerCase() || DEFAULT_API_LOCALE,
  fallbackLanguage: DEFAULT_API_LOCALE,
});

export const buildTranslatedLabelExpression = (
  options: TranslatedFieldExpressionOptions,
): string => {
  const translation = quoteIdentifier(`${options.uniqueAlias}_label`);
  const language = quoteIdentifier(`${options.uniqueAlias}_label_language`);
  const value = `${translation}.${quoteIdentifier(options.fieldColumn)}`;
  const fallback = options.fallbackExpression ?? "'-'";

  return `COALESCE((
    SELECT NULLIF(BTRIM(${value}), '')
    FROM ${tableName(options.table)} ${translation}
    INNER JOIN ${tableName('idiomas')} ${language}
      ON ${language}."id" = ${translation}."idioma_id"
    WHERE ${translation}.${quoteIdentifier(options.ownerColumn)} = ${normalizeSqlReference(options.ownerExpression)}
    ORDER BY CASE
      WHEN ${language}."codigo_idioma" = :currentLanguage THEN 0
      WHEN ${language}."codigo_idioma" = :fallbackLanguage THEN 1
      ELSE 2 END, ${translation}."id"
    LIMIT 1
  ), ${fallback})`;
};
