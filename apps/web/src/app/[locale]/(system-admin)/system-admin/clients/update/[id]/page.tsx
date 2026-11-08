import { notFound } from 'next/navigation';

import { SystemAdminClientSaveView } from '@/features/core/system-admin/clients/pages/SystemAdminClientSaveView';

interface SystemAdminClientUpdatePageProps {
  params: Promise<{ id: string }>;
}

export default async function SystemAdminClientUpdatePage({
  params,
}: SystemAdminClientUpdatePageProps) {
  const { id } = await params;
  const clientId = Number(id);

  if (!Number.isSafeInteger(clientId) || clientId <= 0) {
    notFound();
  }

  return <SystemAdminClientSaveView id={clientId} />;
}
