import { CORE_FUNCTIONALITY_CATALOG } from './core/index.js';
import type { CoreFunctionalityDefinition } from './functionality-catalog.type.js';

export const FUNCTIONALITY_CATALOG = [
  ...CORE_FUNCTIONALITY_CATALOG,
] as const satisfies readonly CoreFunctionalityDefinition[];

export type FunctionalitySlug = (typeof FUNCTIONALITY_CATALOG)[number]['slug'];
