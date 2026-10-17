import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';

type AdminFeatureListPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminFeatureListPage({ params }: AdminFeatureListPageProps) {
  const { slug } = await params;

  if (!isFunctionalitySlug(slug)) {
    notFound();
  }

  const binding = getAdminFeatureBinding(slug, 'list');

  if (!binding) {
    notFound();
  }

  return <binding.View functionalitySlug={slug} entityId={null} />;
}
