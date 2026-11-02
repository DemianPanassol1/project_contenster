import { describe, expect, it } from 'vitest';

import { parseAccessModelStructure } from '@contenster/shared';

describe('access model structure validation', () => {
  const structure = () => ({
    modules: [
      {
        key: null,
        order: 0,
        isActive: true,
        translations: [{ locale: 'pt', name: 'Module', description: null }],
        functionalities: [
          {
            slug: 'users',
            parentSlug: null as string | null,
            icon: null,
            order: 0,
            isActive: false,
            isNavigationGroup: false,
            enabledLanguageCodes: ['pt'],
            translations: [{ locale: 'pt', name: 'Users', description: null }],
          },
        ],
      },
    ],
  });

  it('preserves the explicit inactive functionality state', () => {
    expect(parseAccessModelStructure(structure()).modules[0]?.functionalities[0]?.isActive).toBe(
      false,
    );
  });

  it('rejects unknown properties, unknown catalog identities and cycles', () => {
    expect(() => parseAccessModelStructure({ ...structure(), extra: true })).toThrow();
    const unknown = structure();
    unknown.modules[0].functionalities[0].slug = 'unknown';
    expect(() => parseAccessModelStructure(unknown)).toThrow();
    const cyclic = structure();
    cyclic.modules[0].functionalities[0].parentSlug = 'users';
    expect(() => parseAccessModelStructure(cyclic)).toThrow();
  });

  it('rejects a language without a corresponding translation', () => {
    const invalid = structure();
    invalid.modules[0].functionalities[0].enabledLanguageCodes = ['en'];
    expect(() => parseAccessModelStructure(invalid)).toThrow();
  });
});
