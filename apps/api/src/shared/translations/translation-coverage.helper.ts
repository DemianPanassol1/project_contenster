export const evaluateTranslationCoverage = <TLanguage extends { languageCode: string }>(
  enabledLanguages: TLanguage[],
  translationGroups: { languageCode: string }[][],
) => {
  const languageByCode = new Map(
    enabledLanguages.map((language) => [language.languageCode, language]),
  );
  const codeGroups = translationGroups.map((translations) =>
    translations.map(({ languageCode }) => languageCode),
  );
  const hasDuplicates = codeGroups.some((codes) => new Set(codes).size !== codes.length);
  const hasExactCoverage =
    languageByCode.size > 0 &&
    codeGroups.every((codes) => {
      const uniqueCodes = new Set(codes);
      return (
        uniqueCodes.size === languageByCode.size &&
        [...uniqueCodes].every((code) => languageByCode.has(code))
      );
    });

  return { hasDuplicates, hasExactCoverage, languageByCode };
};

export const hasExactTranslationCoverage = (
  enabledLanguageCodes: string[],
  translatedLanguageCodes: string[],
): boolean =>
  evaluateTranslationCoverage(
    enabledLanguageCodes.map((languageCode) => ({ languageCode })),
    [translatedLanguageCodes.map((languageCode) => ({ languageCode }))],
  ).hasExactCoverage;
