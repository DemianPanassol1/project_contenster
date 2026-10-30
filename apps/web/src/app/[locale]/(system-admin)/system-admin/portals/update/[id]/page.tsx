import { notFound } from 'next/navigation';

import { SystemAdminPortalSaveView } from '@/features/system-admin/portals';

interface SystemAdminPortalUpdatePageProps {
  params: Promise<{ id: string }>;
}

export default async function SystemAdminPortalUpdatePage({
  params,
}: SystemAdminPortalUpdatePageProps) {
  const { id } = await params;
  const portalId = Number(id);

  if (!Number.isInteger(portalId) || portalId < 1) {
    notFound();
  }

  return <SystemAdminPortalSaveView id={portalId} />;
}
