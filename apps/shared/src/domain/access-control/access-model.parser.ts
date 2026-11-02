import { isFunctionalitySlug } from '../../catalog/functionality/functionality-catalog.util.js';
import type { AccessModelStructure } from '../../contracts/access-control/access-models/access-model.contract.js';

export class AccessModelStructureError extends Error {
  constructor(readonly path: string) {
    super(path);
  }
}

export function parseAccessModelStructure(value: unknown): AccessModelStructure {
  const fail = (path: string): never => {
    throw new AccessModelStructureError(path);
  };

  const object = (item: unknown, path: string, keys: string[]): Record<string, unknown> => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return fail(path);
    }

    const result = item as Record<string, unknown>;

    if (Object.keys(result).some((key) => !keys.includes(key))) {
      return fail(path);
    }

    return result;
  };

  const text = (item: unknown, path: string, max: number): string => {
    if (typeof item !== 'string' || !item.trim() || item.length > max) {
      return fail(path);
    }

    return item;
  };

  const array = (item: unknown, path: string): unknown[] =>
    Array.isArray(item) ? item : fail(path);
  const boolean = (item: unknown, path: string): boolean =>
    typeof item === 'boolean' ? item : fail(path);
  const order = (item: unknown, path: string): number =>
    typeof item === 'number' && Number.isInteger(item) && item >= 0 ? item : fail(path);
  const translations = (item: unknown, path: string) => {
    const seen = new Set<string>();
    const result = array(item, path).map((entry, index) => {
      const p = `${path}[${index}]`;
      const record = object(entry, p, ['locale', 'name', 'description']);
      const locale = text(record.locale, `${p}.locale`, 10);

      if (!/^[a-z]{2}$/.test(locale) || seen.has(locale)) {
        return fail(`${p}.locale`);
      }
      seen.add(locale);
      const description =
        record.description === null ? null : text(record.description, `${p}.description`, 255);
      return { locale, name: text(record.name, `${p}.name`, 75), description };
    });
    if (!result.length) {
      return fail(path);
    }

    return result;
  };

  const root = object(value, '$', ['modules']);
  const keys = new Set<string>();
  const slugs = new Set<string>();
  const modules = array(root.modules, '$.modules').map((entry, index) => {
    const p = `$.modules[${index}]`;
    const module = object(entry, p, [
      'key',
      'order',
      'isActive',
      'translations',
      'functionalities',
    ]);
    const key = module.key === null ? null : text(module.key, `${p}.key`, 12);

    if (key !== null && (!/^MOD_[A-Z0-9]{8}$/.test(key) || keys.has(key))) {
      return fail(`${p}.key`);
    }

    if (key) {
      keys.add(key);
    }

    const functionalities = array(module.functionalities, `${p}.functionalities`).map(
      (entry, index) => {
        const fp = `${p}.functionalities[${index}]`;
        const item = object(entry, fp, [
          'slug',
          'parentSlug',
          'icon',
          'order',
          'isNavigationGroup',
          'isActive',
          'enabledLanguageCodes',
          'translations',
        ]);
        const slug = text(item.slug, `${fp}.slug`, 75);

        if (!isFunctionalitySlug(slug) || slugs.has(slug)) {
          return fail(`${fp}.slug`);
        }
        slugs.add(slug);
        const translated = translations(item.translations, `${fp}.translations`);
        const enabledLanguageCodes = array(
          item.enabledLanguageCodes,
          `${fp}.enabledLanguageCodes`,
        ).map((code) => text(code, `${fp}.enabledLanguageCodes`, 2));
        if (
          !enabledLanguageCodes.length ||
          new Set(enabledLanguageCodes).size !== enabledLanguageCodes.length ||
          enabledLanguageCodes.some(
            (code) => !translated.some((translation) => translation.locale === code),
          )
        ) {
          return fail(`${fp}.enabledLanguageCodes`);
        }

        return {
          slug,
          parentSlug:
            item.parentSlug === null ? null : text(item.parentSlug, `${fp}.parentSlug`, 75),
          icon: item.icon === null ? null : text(item.icon, `${fp}.icon`, 100),
          order: order(item.order, `${fp}.order`),
          isNavigationGroup: boolean(item.isNavigationGroup, `${fp}.isNavigationGroup`),
          isActive: boolean(item.isActive, `${fp}.isActive`),
          translations: translated,
          enabledLanguageCodes,
        };
      },
    );
    const bySlug = new Map<string, (typeof functionalities)[number]>(
      functionalities.map((item) => [item.slug, item]),
    );
    for (const item of functionalities) {
      const visited = new Set<string>([item.slug]);
      let parent = item.parentSlug;
      while (parent) {
        if (visited.has(parent) || !bySlug.has(parent)) {
          return fail(`${p}.functionalities`);
        }
        visited.add(parent);
        parent = bySlug.get(parent)!.parentSlug;
      }
    }

    return {
      key,
      order: order(module.order, `${p}.order`),
      isActive: boolean(module.isActive, `${p}.isActive`),
      translations: translations(module.translations, `${p}.translations`),
      functionalities,
    };
  });
  return { modules };
}
