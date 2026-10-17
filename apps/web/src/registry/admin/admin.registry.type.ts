import type { ActionType, CoreFunctionalitySlug } from '@contenster/shared';
import type { ComponentType } from 'react';

export type AdminFeatureMode = 'create' | 'list' | 'update';

export type AdminFeatureViewProps = {
  entityId: string | null;
  functionalitySlug: CoreFunctionalitySlug;
};

export type AdminFeatureModeBinding = {
  action: ActionType;
  View: ComponentType<AdminFeatureViewProps>;
};

export type AdminFeatureBinding = {
  modes: Partial<Record<AdminFeatureMode, AdminFeatureModeBinding>>;
  slug: CoreFunctionalitySlug;
};
