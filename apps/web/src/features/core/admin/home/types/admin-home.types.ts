import type { FunctionalitySlug } from '@contenster/shared';

import type { IconName } from '@/shared';

export interface AdminQuickAccessItem {
  description: string | null;
  icon: IconName;
  id: number;
  slug: FunctionalitySlug;
  title: string;
}

export interface AdminQuickAccessModule {
  id: number;
  items: AdminQuickAccessItem[];
  title: string;
}
