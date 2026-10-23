import { getTranslations } from 'next-intl/server';

export async function HomeView() {
  const t = await getTranslations('public.home');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </main>
  );
}
