import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { AccessDeniedView } from '@/features/admin/access/AccessDeniedView';
import { hasPermissionAction } from '@/features/shared/navigation';
import { getAdminFeatureBinding } from '@/registry/admin';
import { getSession } from '@/services/actions';
import { getSessionFeaturePresentation, isClientSession } from '@/services/session';

type AdminFeatureListPageProps = {
  params: Promise<{ functionality: string }>;
};

export default async function AdminFeatureListPage({ params }: AdminFeatureListPageProps) {
  const { functionality } = await params;

  if (!isFunctionalitySlug(functionality)) {
    notFound();
  }

  const binding = getAdminFeatureBinding(functionality, 'list');

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
    <binding.View functionalitySlug={functionality} entityId={null} presentation={presentation} />
  );
}
