import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { CrewAssignmentManager } from '@/components/CrewAssignmentManager';
import { getCrews } from '@/libs/NotionService';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('CrewManagement');
  return {
    title: t('meta_title'),
  };
}

export default async function CrewManagementPage() {
  const t = await getTranslations('CrewManagement');
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch all crews from Notion
  const crews = await getCrews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('description')}
        </p>
      </div>

      <CrewAssignmentManager crews={crews} />
    </div>
  );
}
