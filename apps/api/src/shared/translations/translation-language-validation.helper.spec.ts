import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { resolveTranslationLanguages } from './translation-language-validation.helper';

describe('resolveTranslationLanguages', () => {
  const languages = [
    { id: 1, languageCode: 'pt' },
    { id: 2, languageCode: 'en' },
  ];

  it('returns languages indexed by code when every requested language exists', () => {
    const result = resolveTranslationLanguages(['pt', 'en'], languages);

    expect(result.get('pt')).toEqual(languages[0]);
    expect(result.get('en')).toEqual(languages[1]);
  });

  it('rejects duplicate translation languages', () => {
    expect(() => resolveTranslationLanguages(['pt', 'pt'], languages)).toThrow(BadRequestException);
  });

  it('rejects unavailable translation languages', () => {
    expect(() => resolveTranslationLanguages(['es'], languages)).toThrow(BadRequestException);
  });
});
