import { notFound } from 'next/navigation';

import { SystemAdminLanguageSaveView } from '@/features/core/system-admin/languages';

export default async function SystemAdminUpdateLanguagePage({
  params,
}: PageProps<'/[locale]/system-admin/languages/update/[id]'>) {
  const { id } = await params;
  const languageId = Number(id);

  if (!Number.isSafeInteger(languageId) || languageId <= 0) {
    notFound();
  }

  return <SystemAdminLanguageSaveView id={languageId} />;
}
