import type { Metadata } from 'next';
import { auth, currentUser } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { JobExecutionWizard } from '@/components/JobExecutionWizard';
import { getClients, getOrderById, getTruckModels } from '@/libs/NotionService';

export const metadata: Metadata = {
  title: 'Execute Job',
};

type ExecuteJobPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

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

export default async function ExecuteJobPage({ params }: ExecuteJobPageProps) {
  const { orderId } = await params;

  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user metadata to verify crew membership
  const user = await currentUser();
  const crewIdRaw = user?.unsafeMetadata?.notion_crew_id as string | undefined;
  const crewId = crewIdRaw ? formatNotionId(crewIdRaw) : undefined;

  // If not a crew member, redirect to main dashboard
  if (!crewId) {
    redirect('/dashboard');
  }

  // Fetch order details
  try {
    const [order, clients, truckModels] = await Promise.all([
      getOrderById(orderId),
      getClients(),
      getTruckModels(),
    ]);

    // Create lookup maps
    const clientMap = new Map(clients.map(c => [c.id, c.name]));
    const truckModelMap = new Map(truckModels.map(t => [t.id, t.model]));

    // Enrich order with names
    const enrichedOrder = {
      id: order.id,
      orderId: order.orderId,
      clientName: clientMap.get(order.client) || 'Unknown Client',
      unitNumber: order.unitNumber,
      truckModelName: truckModelMap.get(order.truckModel) || 'Unknown Model',
      glassPosition: order.glassPosition,
      jobProgress: order.jobProgress,
    };

    return <JobExecutionWizard order={enrichedOrder} />;
  } catch (error) {
    console.error('Error loading order:', error);
    notFound();
  }
}
