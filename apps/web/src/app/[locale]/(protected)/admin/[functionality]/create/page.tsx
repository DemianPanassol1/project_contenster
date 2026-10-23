import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';

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

  return <binding.View functionalitySlug={functionality} entityId={null} />;
}
