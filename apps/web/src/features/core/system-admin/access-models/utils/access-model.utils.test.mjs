import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createAccessModelFunctionality,
  createAccessModelModule,
  getAccessModelDefaultValues,
  getAccessModelLocalizedName,
  mapAccessModelContent,
  mapAccessModelPayload,
} from './access-model.utils.ts';

const languages = [
  { id: 1, locale: 'pt', name: 'Português' },
  { id: 2, locale: 'en', name: 'English' },
];

test('clearing optional description fields produces null at every level without mutating form state', () => {
  const values = getAccessModelDefaultValues(languages);
  const module = values.structure.modules[0];
  const functionality = createAccessModelFunctionality(languages, 0);

  values.translations[0].description = '';
  module.translations[0].description = '   ';
  functionality.translations[0].description = '';
  functionality.translations[1].description = 'Description';
  module.functionalities.push(functionality);

  const payload = mapAccessModelPayload(values);

  assert.equal(payload.translations[0].description, null);
  assert.equal(payload.structure.modules[0].translations[0].description, null);
  assert.equal(payload.structure.modules[0].functionalities[0].translations[0].description, null);
  assert.equal(
    payload.structure.modules[0].functionalities[0].translations[1].description,
    'Description',
  );
  assert.equal(module.translations[0].description, '   ');
  assert.equal(functionality.translations[0].description, '');
});

test('creates independent editor rows without assigning a technical module identity', () => {
  const first = getAccessModelDefaultValues(languages);
  const second = getAccessModelDefaultValues(languages);

  first.structure.modules[0].translations[0].name = 'Administração';

  assert.equal(first.structure.modules[0].key, null);
  assert.equal(second.structure.modules[0].translations[0].name, '');
  assert.deepEqual(
    first.translations.map(({ id }) => id),
    [null, null],
  );
});

test('creates functionality and module rows with the requested position and enabled languages', () => {
  const functionality = createAccessModelFunctionality(languages, 3);
  const module = createAccessModelModule(languages, 2);

  assert.equal(functionality.order, 3);
  assert.equal(functionality.parentSlug, null);
  assert.deepEqual(functionality.enabledLanguageCodes, ['pt']);
  assert.deepEqual(
    functionality.translations.map(({ locale }) => locale),
    ['pt', 'en'],
  );
  assert.equal(module.order, 2);
  assert.equal(module.key, null);
  assert.deepEqual(module.functionalities, []);
});

test('hydrates translations without losing persisted IDs, hierarchy or module keys', () => {
  const module = createAccessModelModule(languages.slice(0, 1), 0);
  const functionality = createAccessModelFunctionality(languages.slice(0, 1), 0);
  const model = {
    id: 10,
    isActive: true,
    translations: [{ id: 20, locale: 'pt', name: 'Modelo', description: null }],
    structure: {
      modules: [
        {
          ...module,
          key: 'MOD_12345678',
          functionalities: [{ ...functionality, slug: 'users', parentSlug: 'profiles' }],
        },
      ],
    },
  };
  const original = JSON.parse(JSON.stringify(model));
  const result = mapAccessModelContent(model, languages);

  assert.equal(result.translations[0].id, 20);
  assert.equal(result.translations[1].id, null);
  assert.equal(result.structure.modules[0].key, 'MOD_12345678');
  assert.equal(result.structure.modules[0].functionalities[0].parentSlug, 'profiles');
  assert.deepEqual(
    result.structure.modules[0].functionalities[0].translations.map(({ locale }) => locale),
    ['pt', 'en'],
  );
  assert.deepEqual(model, original);
});

test('sorts both editor levels by persisted order without mutating the response', () => {
  const module = createAccessModelModule(languages, 0);
  const functionality = createAccessModelFunctionality(languages, 0);
  const model = {
    id: 1,
    isActive: true,
    translations: [],
    structure: {
      modules: [
        { ...module, order: 5, key: 'MOD_55555555' },
        {
          ...module,
          order: 1,
          key: 'MOD_11111111',
          functionalities: [
            { ...functionality, slug: 'users', order: 3 },
            { ...functionality, slug: 'profiles', order: 1 },
          ],
        },
      ],
    },
  };
  const original = JSON.parse(JSON.stringify(model));
  const result = mapAccessModelContent(model, languages);

  assert.deepEqual(
    result.structure.modules.map(({ order }) => order),
    [1, 5],
  );
  assert.deepEqual(
    result.structure.modules[0].functionalities.map(({ order }) => order),
    [1, 3],
  );
  assert.deepEqual(model, original);
});

test('uses the current language for accordion titles and falls back to a nonempty translation', () => {
  const translations = [
    { locale: 'pt', name: 'Usuários' },
    { locale: 'en', name: 'Users' },
  ];

  assert.equal(getAccessModelLocalizedName(translations, 'en-US'), 'Users');
  assert.equal(getAccessModelLocalizedName(translations, 'es'), 'Usuários');
  assert.equal(getAccessModelLocalizedName([{ locale: 'pt', name: ' ' }], 'pt'), '');
  assert.equal(getAccessModelLocalizedName(undefined, 'pt'), '');
});

test('handles partially initialized translation rows while the shared fields align languages', () => {
  const translations = [{ locale: 'pt' }, { locale: 'en', name: 'Users' }];

  assert.equal(getAccessModelLocalizedName(translations, 'pt'), 'Users');
  assert.equal(getAccessModelLocalizedName(translations, 'es'), 'Users');
  assert.equal(getAccessModelLocalizedName([{ locale: 'pt' }], 'pt'), '');
  assert.equal(getAccessModelLocalizedName([{ locale: 'pt', name: null }], 'pt'), '');
  assert.equal(getAccessModelLocalizedName([], 'pt'), '');
});
