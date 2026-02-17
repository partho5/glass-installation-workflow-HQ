import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { BillingTab } from '@/components/BillingTab';
import { CrewAssignmentManager } from '@/components/CrewAssignmentManager';
import { DashboardTabs } from '@/components/DashboardTabs';
import { OrderIntakeForm } from '@/components/OrderIntakeForm';
import { OrdersList } from '@/components/OrdersList';
import { getClients, getCrews, getGlassPositions, getOrders, getTruckModels } from '@/libs/NotionService';

export async function generateMetadata() {
  const t = await getTranslations('Dashboard');
  return {
    title: t('meta_title'),
  } satisfies Metadata;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; status?: string }>;
}) {
  const params = await searchParams;
  const currentView = params.view || 'create';

  // Fetch all data from Notion
  const [clients, truckModels, orders, crews] = await Promise.all([
    getClients(),
    getTruckModels(),
    currentView === 'orders' || currentView === 'billing'
      ? getOrders()
      : Promise.resolve([]),
    currentView === 'orders' || currentView === 'crew' ? getCrews() : Promise.resolve([]),
  ]);
  const glassPositions = getGlassPositions();

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <DashboardTabs />

      {/* Content based on active tab */}
      {currentView === 'create' && (
        <OrderIntakeForm
          clients={clients}
          truckModels={truckModels}
          glassPositions={glassPositions}
        />
      )}
      {currentView === 'orders' && (
        <OrdersList
          orders={orders}
          clients={clients}
          truckModels={truckModels}
          crews={crews}
        />
      )}
      {currentView === 'crew' && (
        <CrewAssignmentManager crews={crews} />
      )}
      {currentView === 'billing' && (
        <BillingTab
          clients={clients}
          orders={orders.filter(o => o.status === 'Completado')}
        />
      )}

      {/* Guide Link at Bottom */}
      <div className="mt-8 text-center">
        <Link
          href="/guide"
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          📖 View User Guide
        </Link>
      </div>
    </div>
  );
}
