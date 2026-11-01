import { ActionType, isFunctionalitySlug, type SessionFunctionality } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';
import { getSession } from '@/services/actions';
import { isClientSession } from '@/services/session';
import { type IconName, icons } from '@/shared';

import { AdminQuickAccess } from './components/AdminQuickAccess';
import type { AdminQuickAccessItem, AdminQuickAccessModule } from './types/admin-home.types';

const DEFAULT_QUICK_ACCESS_ICON: IconName = 'layout-dashboard';

const flattenFunctionalities = (functionalities: SessionFunctionality[]): SessionFunctionality[] =>
  functionalities.flatMap((functionality) => [
    functionality,
    ...flattenFunctionalities(functionality.children),
  ]);

const resolveIconName = (icon: string | null): IconName =>
  icon && icon in icons ? (icon as IconName) : DEFAULT_QUICK_ACCESS_ICON;

export async function AdminHomeView() {
  const session = await getSession();

  if (!isClientSession(session)) {
    return null;
  }

  const modules = session.modules.flatMap<AdminQuickAccessModule>((module) => {
    const items = flattenFunctionalities(module.functionalities).flatMap<AdminQuickAccessItem>(
      (functionality) => {
        const canView = functionality.actions.some((action) => action.type === ActionType.view);
        const binding = getAdminFeatureBinding(functionality.slug, 'list');

        if (
          functionality.isNavigationGroup ||
          !canView ||
          !binding ||
          !isFunctionalitySlug(functionality.slug)
        ) {
          return [];
        }

        return [
          {
            description: functionality.description,
            icon: resolveIconName(functionality.icon),
            id: functionality.id,
            slug: functionality.slug,
            title: functionality.name,
          },
        ];
      },
    );

    return items.length > 0 ? [{ id: module.id, items, title: module.name }] : [];
  });

  return <AdminQuickAccess modules={modules} />;
}
