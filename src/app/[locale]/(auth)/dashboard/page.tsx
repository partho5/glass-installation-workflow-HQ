import type { Metadata } from 'next';
import { DashboardTabs } from '@/components/DashboardTabs';
import { OrderIntakeForm } from '@/components/OrderIntakeForm';
import { OrdersList } from '@/components/OrdersList';
import { getClients, getCrews, getGlassPositions, getOrders, getTruckModels } from '@/libs/NotionService';

export const metadata: Metadata = {
  title: 'Dashboard',
};

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
    currentView === 'orders' ? getOrders() : Promise.resolve([]),
    currentView === 'orders' ? getCrews() : Promise.resolve([]),
  ]);
  const glassPositions = getGlassPositions();

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <DashboardTabs />

      {/* Content based on active tab */}
      {currentView === 'create'
        ? (
            <OrderIntakeForm
              clients={clients}
              truckModels={truckModels}
              glassPositions={glassPositions}
            />
          )
        : (
            <OrdersList
              orders={orders}
              clients={clients}
              truckModels={truckModels}
              crews={crews}
            />
          )}
    </div>
  );
}
