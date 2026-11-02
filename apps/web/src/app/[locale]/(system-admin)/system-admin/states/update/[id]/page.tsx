import { notFound } from 'next/navigation';

import { SystemAdminStateSaveView } from '@/features/core/system-admin/states';

export default async function SystemAdminUpdateStatePage({
  params,
}: PageProps<'/[locale]/system-admin/states/update/[id]'>) {
  const { id } = await params;
  const stateId = Number(id);

  if (!Number.isSafeInteger(stateId) || stateId <= 0) notFound();

  return <SystemAdminStateSaveView id={stateId} />;
}
