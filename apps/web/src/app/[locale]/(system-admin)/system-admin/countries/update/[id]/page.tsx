import { notFound } from 'next/navigation';

import { SystemAdminCountrySaveView } from '@/features/core/system-admin/countries';

export default async function SystemAdminUpdateCountryPage({
  params,
}: PageProps<'/[locale]/system-admin/countries/update/[id]'>) {
  const { id } = await params;
  const countryId = Number(id);

  if (!Number.isSafeInteger(countryId) || countryId <= 0) notFound();

  return <SystemAdminCountrySaveView id={countryId} />;
}
