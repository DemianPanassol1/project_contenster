import { notFound } from 'next/navigation';

import { isFunctionalitySlug } from '@contenster/shared';
import { getAdminFeatureBinding } from '@/registry/admin';

type AdminFeatureCreatePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminFeatureCreatePage({ params }: AdminFeatureCreatePageProps) {
  const { slug } = await params;

  if (!isFunctionalitySlug(slug)) {
    notFound();
  }

  const binding = getAdminFeatureBinding(slug, 'create');

  if (!binding) {
    notFound();
  }

  return <binding.View functionalitySlug={slug} entityId={null} />;
}
