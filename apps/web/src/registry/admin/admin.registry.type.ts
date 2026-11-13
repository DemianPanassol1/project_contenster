import type { ActionType, FunctionalitySlug } from '@contenster/shared';
import type { ComponentType } from 'react';

import type { SessionFeaturePresentation } from '@/services/session';

export type AdminFeatureMode = 'create' | 'list' | 'update';

export type AdminFeatureViewProps = {
  entityId: number | null;
  functionalitySlug: FunctionalitySlug;
  presentation: SessionFeaturePresentation;
};

export type AdminFeatureModeBinding = {
  action: ActionType;
  View: ComponentType<AdminFeatureViewProps>;
};

export type AdminFeatureBinding = {
  modes: Partial<Record<AdminFeatureMode, AdminFeatureModeBinding>>;
  slug: FunctionalitySlug;
};
