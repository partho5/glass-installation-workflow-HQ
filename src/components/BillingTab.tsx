'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Client {
  id: string;
  name: string;
}

interface Order {
  id: string;
  orderId: string;
  client: string;
  unitNumber: string;
  truckModel: string;
  glassPosition: string;
  price?: number;
  completedAt?: string;
}

interface BillingTabProps {
  clients: Client[];
  orders: Order[];
}

export function BillingTab({ clients, orders }: BillingTabProps) {
  const t = useTranslations('BillingTab');
  const router = useRouter();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Filter completed orders by client and date
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (selectedClientId) {
      filtered = filtered.filter(o => o.client === selectedClientId);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(o => {
        if (!o.completedAt) return false;
        const completedDate = new Date(o.completedAt);
        return (
          completedDate >= new Date(startDate)
          && completedDate <= new Date(endDate)
        );
      });
    }

    return filtered;
  }, [orders, selectedClientId, startDate, endDate]);

  const handleGenerateInvoice = async () => {
    if (!selectedClientId) {
      setMessage({ type: 'error', text: t('error_select_client') });
      return;
    }

    if (selectedOrders.length === 0) {
      setMessage({ type: 'error', text: t('error_select_orders') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Generate PDF invoice
      const invoiceRes = await fetch('/api/orders/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          orderIds: selectedOrders,
          startDate,
          endDate,
        }),
      });

      if (!invoiceRes.ok) {
        const errorData = await invoiceRes.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const invoiceData = await invoiceRes.json();

      // 2. Send via WhatsApp (optional - ask user first)
      const client = clients.find(c => c.id === selectedClientId);
      if (
        client
        && confirm(t('confirm_send_whatsapp'))
      ) {
        const whatsappRes = await fetch(
          '/api/orders/send-invoice-whatsapp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientPhone: '5215551234567', // TODO: Get from client data
              invoiceNumber: invoiceData.invoiceNumber,
              pdfUrl: invoiceData.pdfUrl,
              clientName: client.name,
            }),
          },
        );

        if (!whatsappRes.ok) {
          const errorData = await whatsappRes.json();
          throw new Error(
            errorData.error || 'Failed to send WhatsApp',
          );
        }
      }

      setMessage({
        type: 'success',
        text: t('success', { invoiceNumber: invoiceData.invoiceNumber }),
      });

      // Reset form
      setSelectedOrders([]);
      router.refresh(); // Refresh to show updated "Facturado" status
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || t('error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const clientMap = useMemo(
    () => new Map(clients.map(c => [c.id, c])),
    [clients],
  );

  const totalAmount = useMemo(
    () =>
      filteredOrders
        .filter(o => selectedOrders.includes(o.id))
        .reduce((sum, o) => sum + (o.price || 0), 0),
    [filteredOrders, selectedOrders],
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">{t('title')}</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Client selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('select_client')}
            </label>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="">{t('all_clients')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('from_date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('to_date')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t('completed_orders')}
            {' '}
            (
            {filteredOrders.length}
            )
          </h3>
          {selectedOrders.length > 0 && (
            <button
              onClick={handleGenerateInvoice}
              disabled={loading}
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? t('generating') : t('generate_invoice')}
              {' '}
              (
              {selectedOrders.length}
              )
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-2">
          {filteredOrders.map(order => (
            <label
              key={order.id}
              className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedOrders.includes(order.id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedOrders([...selectedOrders, order.id]);
                  } else {
                    setSelectedOrders(
                      selectedOrders.filter(id => id !== order.id),
                    );
                  }
                }}
                className="h-5 w-5"
              />
              <div className="grid flex-1 grid-cols-4 gap-4">
                <div>
                  <span className="font-semibold">{order.orderId}</span>
                  <p className="text-sm text-gray-600">
                    {clientMap.get(order.client)?.name}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {order.unitNumber}
                </div>
                <div className="text-sm text-gray-600">
                  {order.glassPosition}
                </div>
                <div className="text-right font-semibold">
                  $
                  {order.price?.toFixed(2) || '0.00'}
                </div>
              </div>
            </label>
          ))}

          {filteredOrders.length === 0 && (
            <p className="py-8 text-center text-gray-500">
              {t('no_completed_orders')}
            </p>
          )}
        </div>

        {selectedOrders.length > 0 && (
          <div className="mt-4 border-t pt-4 text-right">
            <p className="text-lg font-bold">
              {t('total')}
              :
              {' '}
              $
              {totalAmount.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
