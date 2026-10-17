import { type CoreFunctionalitySlug, isFunctionalitySlug } from '@contenster/shared';

import { CORE_ADMIN_FEATURE_BINDINGS } from './core/core-admin.registry';
import type {
  AdminFeatureBinding,
  AdminFeatureMode,
  AdminFeatureModeBinding,
} from './admin.registry.type';

const bindings = [...CORE_ADMIN_FEATURE_BINDINGS] satisfies readonly AdminFeatureBinding[];
const registry = new Map<CoreFunctionalitySlug, AdminFeatureBinding>();

for (const binding of bindings) {
  if (registry.has(binding.slug)) {
    throw new Error(`Duplicate admin feature binding: ${binding.slug}`);
  }

  registry.set(binding.slug, binding);
}

export const getAdminFeatureBinding = (
  slug: string,
  mode: AdminFeatureMode,
): AdminFeatureModeBinding | null => {
  if (!isFunctionalitySlug(slug)) {
    return null;
  }

  return registry.get(slug)?.modes[mode] ?? null;
};
