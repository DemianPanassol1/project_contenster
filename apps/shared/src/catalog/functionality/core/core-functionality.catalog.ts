import type { CoreFunctionalityDefinition } from '../functionality-catalog.type.js';

export const CORE_FUNCTIONALITY_IDENTITIES = {
  actions: 'actions',
  cities: 'cities',
  clientLogs: 'client-logs',
  clientStorage: 'client-storage',
  clients: 'clients',
  countries: 'countries',
  functionalities: 'functionalities',
  languages: 'languages',
  modules: 'modules',
  profiles: 'profiles',
  states: 'states',
  users: 'users',
} as const;

export const CORE_FUNCTIONALITY_CATALOG = [
  { slug: CORE_FUNCTIONALITY_IDENTITIES.actions },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.languages },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.clients },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.clientStorage },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.clientLogs },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.users },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.profiles },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.modules },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.functionalities },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.countries },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.states },
  { slug: CORE_FUNCTIONALITY_IDENTITIES.cities },
] as const satisfies readonly CoreFunctionalityDefinition[];

export type CoreFunctionalitySlug =
  (typeof CORE_FUNCTIONALITY_IDENTITIES)[keyof typeof CORE_FUNCTIONALITY_IDENTITIES];
