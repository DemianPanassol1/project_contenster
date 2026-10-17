import { FUNCTIONALITY_CATALOG, type FunctionalitySlug } from './functionality.catalog.js';

const functionalitySlugs = new Set<string>(
  FUNCTIONALITY_CATALOG.map((functionality) => functionality.slug),
);

export const isFunctionalitySlug = (value: string): value is FunctionalitySlug =>
  functionalitySlugs.has(value);
