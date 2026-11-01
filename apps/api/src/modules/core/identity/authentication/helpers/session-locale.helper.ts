export const resolveSessionLanguages = <TLanguage extends { languageCode: string }>(
  links: readonly { language: TLanguage }[],
): TLanguage[] => links.map(({ language }) => language);

export const resolveSessionLocale = (languages: readonly { languageCode: string }[]): string =>
  languages.find((language) => language.languageCode === 'pt')?.languageCode ??
  languages[0]?.languageCode ??
  'pt';
