import { describe, expect, it } from 'vitest';

import { resolveSessionLanguages, resolveSessionLocale } from './session-locale.helper';

describe('session locale helpers', () => {
  it('prefers Portuguese when available and otherwise preserves the first language', () => {
    expect(resolveSessionLocale([{ languageCode: 'en' }, { languageCode: 'pt' }])).toBe('pt');
    expect(resolveSessionLocale([{ languageCode: 'es' }, { languageCode: 'en' }])).toBe('es');
    expect(resolveSessionLocale([])).toBe('pt');
  });

  it('unwraps client language links without changing their language objects', () => {
    const language = { id: 1, languageCode: 'pt' };

    expect(resolveSessionLanguages([{ language }])).toEqual([language]);
  });
});
