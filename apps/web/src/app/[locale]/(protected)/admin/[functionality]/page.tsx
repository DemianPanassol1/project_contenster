import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';

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

  return <binding.View functionalitySlug={functionality} entityId={null} />;
}
