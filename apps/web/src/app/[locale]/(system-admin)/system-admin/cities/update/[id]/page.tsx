import { notFound } from 'next/navigation';

import { SystemAdminCitySaveView } from '@/features/core/system-admin/cities';

export default async function SystemAdminUpdateCityPage({
  params,
}: PageProps<'/[locale]/system-admin/cities/update/[id]'>) {
  const { id } = await params;
  const cityId = Number(id);

  if (!Number.isSafeInteger(cityId) || cityId <= 0) notFound();

  return <SystemAdminCitySaveView id={cityId} />;
}
