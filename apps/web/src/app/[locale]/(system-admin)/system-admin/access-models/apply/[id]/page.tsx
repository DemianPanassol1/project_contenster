import { notFound } from 'next/navigation';

import { SystemAdminAccessModelApplyView } from '@/features/core/system-admin/access-models';
import { parseIdParam } from '@/features/shared/navigation';

export default async function ApplyAccessModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const modelId = parseIdParam(id);

  if (modelId === null) {
    notFound();
  }

  return <SystemAdminAccessModelApplyView modelId={modelId} />;
}
