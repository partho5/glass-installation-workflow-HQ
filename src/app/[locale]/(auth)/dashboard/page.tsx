import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BillingTab } from '@/components/BillingTab';
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
  const t = await getTranslations('AdminPanel');

  // Fetch all data from Notion
  const [clients, truckModels, orders, crews] = await Promise.all([
    getClients(),
    getTruckModels(),
    currentView === 'orders' || currentView === 'billing'
      ? getOrders()
      : Promise.resolve([]),
    currentView === 'orders' ? getCrews() : Promise.resolve([]),
  ]);
  const glassPositions = getGlassPositions();

  return (
    <div className="space-y-6">
      {/* Admin Quick Links */}
      <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white shadow">
        <div>
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-purple-100">{t('description')}</p>
        </div>
        <Link
          href="/dashboard/crew-management"
          className="rounded-lg bg-white px-6 py-3 font-medium text-purple-700 transition-colors hover:bg-purple-50"
        >
          👥
          {' '}
          {t('crew_management')}
        </Link>
      </div>

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
      {currentView === 'billing' && (
        <BillingTab
          clients={clients}
          orders={orders.filter(o => o.status === 'Completado')}
        />
      )}
    </div>
  );
}
