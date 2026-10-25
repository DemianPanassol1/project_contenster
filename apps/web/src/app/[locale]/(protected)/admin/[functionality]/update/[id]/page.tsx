import { notFound } from 'next/navigation';

import { ActionType, isFunctionalitySlug } from '@contenster/shared';
import { AccessDeniedView } from '@/features/admin/access/AccessDeniedView';
import { getAdminFeatureBinding } from '@/registry/admin';
import { getSession } from '@/services/actions';
import { hasFunctionalityAction, isClientSession } from '@/services/session';

type AdminFeatureUpdatePageProps = {
  params: Promise<{ functionality: string; id: string }>;
};

export default async function AdminFeatureUpdatePage({ params }: AdminFeatureUpdatePageProps) {
  const { functionality, id } = await params;

  if (!isFunctionalitySlug(functionality)) {
    notFound();
  }

  const binding = getAdminFeatureBinding(functionality, 'update');

  if (!binding) {
    notFound();
  }

  const session = await getSession();

  if (
    !isClientSession(session) ||
    !hasFunctionalityAction(session, functionality, ActionType.edit)
  ) {
    return <AccessDeniedView />;
  }

  return <binding.View functionalitySlug={functionality} entityId={id} />;
}
