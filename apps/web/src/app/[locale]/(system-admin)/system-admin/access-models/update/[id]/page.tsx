import { notFound } from 'next/navigation';

import { SystemAdminAccessModelSaveView } from '@/features/core/system-admin/access-models';
import { parseIdParam } from '@/features/shared/navigation';

export default async function UpdateAccessModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const accessModelId = parseIdParam(id);

  if (accessModelId === null) {
    notFound();
  }

  return <SystemAdminAccessModelSaveView id={accessModelId} />;
}
