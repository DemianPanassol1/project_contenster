import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { AccessDeniedView } from '@/features/admin/access/AccessDeniedView';
import { hasPermissionAction, parseIdParam } from '@/features/shared/navigation';
import { getAdminFeatureBinding } from '@/registry/admin';
import { getSession } from '@/services/actions';
import { getSessionFeaturePresentation, isClientSession } from '@/services/session';

type AdminFeatureUpdatePageProps = {
  params: Promise<{ functionality: string; id: string }>;
};

export default async function AdminFeatureUpdatePage({ params }: AdminFeatureUpdatePageProps) {
  const { functionality, id } = await params;

  const entityId = parseIdParam(id);

  if (!isFunctionalitySlug(functionality) || entityId === null) {
    notFound();
  }

  const binding = getAdminFeatureBinding(functionality, 'update');

  if (!binding) {
    notFound();
  }

  const session = await getSession();

  if (!isClientSession(session)) {
    return <AccessDeniedView />;
  }

  const presentation = getSessionFeaturePresentation(session, functionality);

  if (!presentation || !hasPermissionAction(presentation.actions, binding.action)) {
    return <AccessDeniedView />;
  }

  return (
    <binding.View
      functionalitySlug={functionality}
      entityId={entityId}
      presentation={presentation}
    />
  );
}
