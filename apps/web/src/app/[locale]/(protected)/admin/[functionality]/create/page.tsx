import { notFound } from 'next/navigation';

import { ActionType, isFunctionalitySlug } from '@contenster/shared';
import { AccessDeniedView } from '@/features/admin/access/AccessDeniedView';
import { getAdminFeatureBinding } from '@/registry/admin';
import { getSession } from '@/services/actions';
import { hasFunctionalityAction, isClientSession } from '@/services/session';

type AdminFeatureCreatePageProps = {
  params: Promise<{ functionality: string }>;
};

export default async function AdminFeatureCreatePage({ params }: AdminFeatureCreatePageProps) {
  const { functionality } = await params;

  if (!isFunctionalitySlug(functionality)) {
    notFound();
  }

  const binding = getAdminFeatureBinding(functionality, 'create');

  if (!binding) {
    notFound();
  }

  const session = await getSession();

  if (
    !isClientSession(session) ||
    !hasFunctionalityAction(session, functionality, ActionType.create)
  ) {
    return <AccessDeniedView />;
  }

  return <binding.View functionalitySlug={functionality} entityId={null} />;
}
