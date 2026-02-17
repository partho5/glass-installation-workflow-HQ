import type { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { CrewJobList } from '@/components/CrewJobList';
import { getClients, getCrewJobs, getTruckModels } from '@/libs/NotionService';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('CrewDashboard');
  return {
    title: t('meta_title'),
  };
}

// Convert UUID without hyphens to standard UUID format
function formatNotionId(id: string): string {
  if (id.includes('-')) {
    return id;
  } // Already formatted
  if (id.length !== 32) {
    return id;
  } // Invalid length

  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

export default async function CrewDashboard() {
  const t = await getTranslations('CrewDashboard');

  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user metadata to check crew assignment
  const user = await currentUser();
  const crewIdRaw = user?.unsafeMetadata?.notion_crew_id as string | undefined;
  const crewId = crewIdRaw ? formatNotionId(crewIdRaw) : undefined;

  // If not a crew member, redirect to main dashboard
  if (!crewId) {
    redirect('/dashboard');
  }

  // Fetch crew's assigned jobs
  const [jobs, clients, truckModels] = await Promise.all([
    getCrewJobs(crewId),
    getClients(),
    getTruckModels(),
  ]);

  // Create lookup maps for client and truck model names
  const clientMap = new Map(clients.map(c => [c.id, c.name]));
  const truckModelMap = new Map(truckModels.map(t => [t.id, t.model]));

  // Enrich jobs with client and truck model names
  const enrichedJobs = jobs.map(job => ({
    id: job.id,
    orderId: job.orderId,
    clientName: clientMap.get(job.client) || 'Unknown Client',
    unitNumber: job.unitNumber,
    truckModelName: truckModelMap.get(job.truckModel) || 'Unknown Model',
    glassPosition: job.glassPosition,
    scheduleDate: job.scheduleDate,
  }));

  return (
    <div className="space-y-6 p-0 md:p-4">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-blue-100">
          {user?.firstName || t('no_crew_assigned')}
        </p>
      </div>

      {/* Job List */}
      <CrewJobList jobs={enrichedJobs} />
    </div>
  );
}
