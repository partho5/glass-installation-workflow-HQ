'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type OrderDetailModalProps = {
  order: {
    id: string;
    orderId: string;
    clientName: string;
    unitNumber: string;
    truckModelName: string;
    glassPosition: string;
    status: string;
    notes: string;
    createdAt: string;
  };
  crews: { id: string; name: string; leadInstaller: string; phone: string; status: string }[];
  onClose: () => void;
};

export function OrderDetailModal({ order, crews, onClose }: OrderDetailModalProps) {
  const t = useTranslations('OrderDetailModal');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInventoryNote, setShowInventoryNote] = useState(false);
  const [inventoryNote, setInventoryNote] = useState('');
  const [showScheduling, setShowScheduling] = useState(false);
  const [crewId, setCrewId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  const handleStatusChange = async (newStatus: string, note?: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
          note,
        }),
      });

      if (!response.ok) {
        throw new Error(t('update_error'));
      }

      // Refresh the page to show updated data
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage(t('update_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnStock = () => {
    setShowInventoryNote(true);
  };

  const handleSinStock = () => {
    handleStatusChange('Sin Stock', t('mark_out_of_stock'));
  };

  const handleMaterialRecibido = () => {
    handleStatusChange('En Stock', t('mark_in_stock'));
  };

  const confirmEnStock = () => {
    handleStatusChange('En Stock', inventoryNote || t('mark_in_stock'));
  };

  const handleScheduleOrder = async () => {
    if (!crewId || !scheduleDate) {
      setErrorMessage(t('schedule_error'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/orders/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          crewId,
          scheduleDate,
        }),
      });

      if (!response.ok) {
        throw new Error(t('schedule_error'));
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error scheduling order:', error);
      setErrorMessage(t('schedule_error'));
    } finally {
      setLoading(false);
    }
  };

  // Determine which action buttons to show based on current status
  const renderActionButtons = () => {
    if (loading) {
      return (
        <div className="text-center text-gray-500">
          {t('updating')}
        </div>
      );
    }

    switch (order.status) {
      case 'Pendiente':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">{t('inventory_check')}</h3>
            {!showInventoryNote
              ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleEnStock}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-green-700 active:bg-green-800"
                    >
                      <span className="text-xl">✅</span>
                      <span>{t('status_in_stock')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSinStock}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-red-700 active:bg-red-800"
                    >
                      <span className="text-xl">🔴</span>
                      <span>{t('status_out_of_stock')}</span>
                    </button>
                  </div>
                )
              : (
                  <div className="space-y-3">
                    <textarea
                      value={inventoryNote}
                      onChange={e => setInventoryNote(e.target.value)}
                      placeholder={t('inventory_note_placeholder')}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={confirmEnStock}
                        className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                      >
                        {t('mark_in_stock')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInventoryNote(false)}
                        className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </div>
                )}
          </div>
        );

      case 'Sin Stock':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">{t('inventory_check')}</h3>
            <button
              type="button"
              onClick={handleMaterialRecibido}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            >
              <span className="text-xl">📦</span>
              <span>{t('mark_in_stock')}</span>
            </button>
          </div>
        );

      case 'En Stock':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">{t('schedule_installation')}</h3>
            {!showScheduling
              ? (
                  <button
                    type="button"
                    onClick={() => setShowScheduling(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-medium text-white hover:bg-blue-700 active:bg-blue-800"
                  >
                    <span className="text-xl">📅</span>
                    <span>{t('schedule_installation')}</span>
                  </button>
                )
              : (
                  <div className="space-y-4">
                    {/* Crew Selection */}
                    <div>
                      <label htmlFor="crewId" className="mb-2 block text-sm font-medium text-gray-700">
                        {t('assigned_crew_label')}
                        {' '}
                        *
                      </label>
                      <select
                        id="crewId"
                        value={crewId}
                        onChange={e => setCrewId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                        required
                      >
                        <option value="">{t('assigned_crew_placeholder')}</option>
                        {crews.map(crew => (
                          <option key={crew.id} value={crew.id}>
                            {crew.name}
                            {' '}
                            -
                            {crew.leadInstaller}
                            {' '}
                            (
                            {crew.status}
                            )
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Schedule Date/Time */}
                    <div>
                      <label htmlFor="scheduleDate" className="mb-2 block text-sm font-medium text-gray-700">
                        {t('schedule_date_label')}
                        {' '}
                        *
                      </label>
                      <input
                        id="scheduleDate"
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                        required
                      />
                    </div>

                    {/* Material Checklist */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 text-sm font-semibold text-gray-700">Material Checklist:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>
                          ✓
                          {order.glassPosition}
                          {' '}
                          -
                          {order.truckModelName}
                        </li>
                        <li>✓ Uretano</li>
                        <li>✓ Molduras</li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleScheduleOrder}
                        className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                      >
                        {t('schedule_button')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowScheduling(false)}
                        className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </div>
                )}
          </div>
        );

      case 'Programado':
      case 'Completado':
        return (
          <div className="text-center text-sm text-gray-500">
            {t('current_status')}
            :
            {' '}
            {order.status}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      {/* Modal */}
      <div className="w-full max-w-2xl rounded-t-2xl bg-white sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">{order.orderId}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-6 sm:max-h-[600px]">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`
                inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
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

          {/* Order Details */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">{t('client')}</div>
              <p className="mt-1 text-base font-medium text-gray-900">{order.clientName}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-500">{t('unit')}</div>
                <p className="mt-1 text-base font-medium text-gray-900">{order.unitNumber}</p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">{t('glass_position')}</div>
                <p className="mt-1 text-base font-medium text-gray-900">{order.glassPosition}</p>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">{t('truck_model')}</div>
              <p className="mt-1 text-base font-medium text-gray-900">{order.truckModelName}</p>
            </div>

            {order.notes && (
              <div>
                <div className="text-sm font-medium text-gray-500">{t('notes')}</div>
                <p className="mt-1 text-base text-gray-700">{order.notes}</p>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-500">{t('created_date')}</div>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            {renderActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );
}
