import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';

type AdminFeatureUpdatePageProps = {
  params: Promise<{ id: string; slug: string }>;
};

export default async function AdminFeatureUpdatePage({ params }: AdminFeatureUpdatePageProps) {
  const { id, slug } = await params;

  if (!isFunctionalitySlug(slug)) {
    notFound();
  }

  const binding = getAdminFeatureBinding(slug, 'update');

  if (!binding) {
    notFound();
  }

  return <binding.View functionalitySlug={slug} entityId={id} />;
}
