import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';

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

  return <binding.View functionalitySlug={functionality} entityId={id} />;
}
