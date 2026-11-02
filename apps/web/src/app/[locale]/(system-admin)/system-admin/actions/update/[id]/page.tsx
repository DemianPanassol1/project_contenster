import { notFound } from 'next/navigation';

import { SystemAdminActionSaveView } from '@/features/core/system-admin/actions';

export default async function SystemAdminUpdateActionPage({
  params,
}: PageProps<'/[locale]/system-admin/actions/update/[id]'>) {
  const { id } = await params;
  const actionId = Number(id);

  if (!Number.isSafeInteger(actionId) || actionId <= 0) {
    notFound();
  }

  return <SystemAdminActionSaveView id={actionId} />;
}
