'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { OrderDetailModal } from './OrderDetailModal';

type Order = {
  id: string;
  orderId: string;
  client: string;
  clientName?: string;
  unitNumber: string;
  truckModel: string;
  truckModelName?: string;
  glassPosition: string;
  status: string;
  notes: string;
  createdAt: string;
  assignedCrew?: string | null;
  crewName?: string;
  clientPhone?: string;
  scheduledDate?: string | null;
  invoiceNumber?: string | null;
  invoicePdfUrl?: string | null;
};

type OrdersListProps = {
  crews: { id: string; name: string; leadInstaller: string; phone: string; status: string }[];
  orders: Order[];
  clients: { id: string; name: string; phone: string }[];
  truckModels: { id: string; model: string; manufacturer: string }[];
};

const WORKFLOW_STATUSES = [
  { key: 'all', labelKey: 'filter_all', icon: '📋' },
  { key: 'Pendiente', labelKey: 'filter_pending', icon: '⏳' },
  { key: 'En Stock', labelKey: 'filter_in_stock', icon: '📦' },
  { key: 'Sin Stock', labelKey: 'filter_out_of_stock', icon: '❌' },
  { key: 'Programado', labelKey: 'filter_scheduled', icon: '📅' },
  { key: 'Completado', labelKey: 'filter_completed', icon: '🏁' },
];

export function OrdersList({ orders, clients, truckModels, crews }: OrdersListProps) {
  const t = useTranslations('OrdersList');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('status') || 'all';
  const selectedOrderId = searchParams.get('orderId');

  // Create lookup maps for client and truck model names - memoized to avoid recreating on every render
  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const truckModelMap = useMemo(() => new Map(truckModels.map(t => [t.id, `${t.manufacturer} ${t.model}`])), [truckModels]);
  const crewMap = useMemo(() => new Map(crews.map(c => [c.id, c.name])), [crews]);

  // Enhance orders with resolved names using useMemo to avoid dependency issues
  const enhancedOrders = useMemo(() => orders.map(order => ({
    ...order,
    clientName: clientMap.get(order.client)?.name || 'Unknown Client',
    clientPhone: clientMap.get(order.client)?.phone || '',
    truckModelName: truckModelMap.get(order.truckModel) || 'Unknown Model',
    crewName: order.assignedCrew ? crewMap.get(order.assignedCrew) || 'Unknown Crew' : undefined,
  })), [orders, clientMap, truckModelMap, crewMap]);

  // Derive selected order from URL and orders instead of using effect
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) {
      return null;
    }
    return enhancedOrders.find(o => o.id === selectedOrderId) || null;
  }, [selectedOrderId, enhancedOrders]);

  // Filter orders based on current tab
  const filteredOrders = currentTab === 'all'
    ? enhancedOrders
    : enhancedOrders.filter(order => order.status === currentTab);

  // Count orders by status
  const counts = {
    'all': enhancedOrders.length,
    'Pendiente': enhancedOrders.filter(o => o.status === 'Pendiente').length,
    'En Stock': enhancedOrders.filter(o => o.status === 'En Stock').length,
    'Sin Stock': enhancedOrders.filter(o => o.status === 'Sin Stock').length,
    'Programado': enhancedOrders.filter(o => o.status === 'Programado').length,
    'Completado': enhancedOrders.filter(o => o.status === 'Completado').length,
  };

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('status');
    } else {
      params.set('status', tab);
    }
    router.push(`?${params.toString()}`);
  };

  const handleOrderClick = (order: typeof enhancedOrders[0]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('orderId', order.id);
    router.push(`?${params.toString()}`);
  };

  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('orderId');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Visualization */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Flujo de cada orden</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⏳</span>
            <span className="text-sm font-medium text-gray-700">Pendiente</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span className="text-sm font-medium text-gray-700">Inventario</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span className="text-sm font-medium text-gray-700">Programar</span>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2">
            <span>🏁</span>
            <span className="text-sm font-medium text-gray-700">Completado</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
            {WORKFLOW_STATUSES.map(status => (
              <button
                key={status.key}
                type="button"
                onClick={() => handleTabChange(status.key)}
                className={`
                  flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors
                  ${currentTab === status.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }
                `}
              >
                <span>{status.icon}</span>
                <span>{t(status.labelKey as any)}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {counts[status.key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders List */}
        <div className="p-6">
          {filteredOrders.length === 0
            ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">{t('no_orders')}</p>
                </div>
              )
            : (
                <div className="space-y-4">
                  {filteredOrders.map(order => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => handleOrderClick(order)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-blue-300 hover:shadow-md active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-900">{order.orderId}</h3>
                            <span
                              className={`
                            rounded-full px-3 py-1 text-xs font-semibold
                            ${order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${order.status === 'En Stock' ? 'bg-green-100 text-green-800' : ''}
                            ${order.status === 'Sin Stock' ? 'bg-red-100 text-red-800' : ''}
                            ${order.status === 'Programado' ? 'bg-blue-100 text-blue-800' : ''}
                            ${order.status === 'Completado' ? 'bg-gray-100 text-gray-800' : ''}
                          `}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                {t('client')}
                                :
                              </span>
                              <span className="ml-2 text-gray-600">{order.clientName}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                {t('unit')}
                                :
                              </span>
                              <span className="ml-2 text-gray-600">{order.unitNumber}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Truck Model:</span>
                              <span className="ml-2 text-gray-600">{order.truckModelName}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                {t('glass')}
                                :
                              </span>
                              <span className="ml-2 text-gray-600">{order.glassPosition}</span>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="mt-3 text-sm">
                              <span className="font-medium text-gray-700">Notes:</span>
                              <p className="mt-1 text-gray-600">{order.notes}</p>
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-500">
                            {t('created')}
                            :
                            {' '}
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          crews={crews}
          order={selectedOrder}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
