import { ActionType, CORE_FUNCTIONALITY_IDENTITIES } from '@contenster/shared';
import { SystemModuleSaveView, SystemModulesListView } from '@/features/admin/modules';

import type { AdminFeatureBinding } from '../admin.registry.type';

export const CORE_ADMIN_FEATURE_BINDINGS: readonly AdminFeatureBinding[] = [
  {
    modes: {
      create: {
        action: ActionType.create,
        View: SystemModuleSaveView,
      },
      list: {
        action: ActionType.view,
        View: SystemModulesListView,
      },
      update: {
        action: ActionType.edit,
        View: SystemModuleSaveView,
      },
    },
    slug: CORE_FUNCTIONALITY_IDENTITIES.modules,
  },
];
