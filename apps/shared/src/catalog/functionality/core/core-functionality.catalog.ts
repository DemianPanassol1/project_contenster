import type { CoreFunctionalityDefinition } from '../functionality-catalog.type.js';

export const CORE_FUNCTIONALITY_CATALOG = [
  { slug: 'clients' },
  { slug: 'users' },
  { slug: 'profiles' },
  { slug: 'modules' },
  { slug: 'functionalities' },
  { slug: 'countries' },
  { slug: 'states' },
  { slug: 'cities' },
] as const satisfies readonly CoreFunctionalityDefinition[];

export type CoreFunctionalitySlug = (typeof CORE_FUNCTIONALITY_CATALOG)[number]['slug'];
