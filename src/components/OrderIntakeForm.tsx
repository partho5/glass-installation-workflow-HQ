'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Client = {
  id: string;
  name: string;
};

type TruckModel = {
  id: string;
  model: string;
  manufacturer: string;
};

type OrderIntakeFormProps = {
  clients: Client[];
  truckModels: TruckModel[];
  glassPositions: string[];
};

export function OrderIntakeForm({ clients, truckModels, glassPositions }: OrderIntakeFormProps) {
  const t = useTranslations('OrderIntakeForm');
  const [formData, setFormData] = useState({
    clientId: '',
    unitNumber: '',
    truckModelId: '',
    glassPosition: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pricePreview, setPricePreview] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceNotFound, setPriceNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      const priceMsg = result.price !== null && result.price !== undefined
        ? ` - ${t('price_label')}: $${result.price.toFixed(2)}`
        : '';
      setMessage({
        type: 'success',
        text: t('success_message', { orderId: result.orderId }) + priceMsg,
      });

      // Reset form
      setFormData({
        clientId: '',
        unitNumber: '',
        truckModelId: '',
        glassPosition: '',
        notes: '',
      });
      setPricePreview(null);
      setPriceNotFound(false);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || t('error_message'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch price preview when all required fields are filled
  useEffect(() => {
    const fetchPrice = async () => {
      // Only fetch if all three fields are selected
      if (!formData.clientId || !formData.truckModelId || !formData.glassPosition) {
        setPricePreview(null);
        setPriceNotFound(false);
        return;
      }

      setPriceLoading(true);
      try {
        const response = await fetch('/api/orders/preview-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: formData.clientId,
            truckModelId: formData.truckModelId,
            glassPosition: formData.glassPosition,
          }),
        });

        const result = await response.json();

        if (response.ok && result.found) {
          setPricePreview(result.price);
          setPriceNotFound(false);
        } else {
          setPricePreview(null);
          setPriceNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        setPricePreview(null);
        setPriceNotFound(false);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [formData.clientId, formData.truckModelId, formData.glassPosition]);

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('title')}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client */}
        <div>
          <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-gray-700">
            {t('client_label')}
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">{t('client_placeholder')}</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Number */}
        <div>
          <label htmlFor="unitNumber" className="mb-1 block text-sm font-medium text-gray-700">
            {t('unit_number_label')}
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="unitNumber"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            required
            placeholder={t('unit_number_placeholder')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Truck Model */}
        <div>
          <label htmlFor="truckModelId" className="mb-1 block text-sm font-medium text-gray-700">
            {t('truck_model_label')}
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="truckModelId"
            name="truckModelId"
            value={formData.truckModelId}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">{t('truck_model_placeholder')}</option>
            {truckModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.manufacturer}
                {' '}
                -
                {model.model}
              </option>
            ))}
          </select>
        </div>

        {/* Glass Position */}
        <div>
          <label htmlFor="glassPosition" className="mb-1 block text-sm font-medium text-gray-700">
            {t('glass_position_label')}
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="glassPosition"
            name="glassPosition"
            value={formData.glassPosition}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">{t('glass_position_placeholder')}</option>
            {glassPositions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Price Preview */}
        {(pricePreview !== null || priceNotFound) && (
          <div
            className={`rounded-md p-4 ${
              priceNotFound
                ? 'border border-yellow-200 bg-yellow-50'
                : 'border border-blue-200 bg-blue-50'
            }`}
          >
            {priceLoading
              ? (
                  <p className="text-sm text-gray-600">{t('price_loading')}</p>
                )
              : priceNotFound
                ? (
                    <>
                      <p className="text-sm font-semibold text-yellow-800">
                        ⚠️
                        {' '}
                        {t('price_not_found')}
                      </p>
                      <p className="mt-1 text-xs text-yellow-700">
                        {t('price_not_found_hint')}
                      </p>
                    </>
                  )
                : (
                    <p className="text-lg font-bold text-blue-900">
                      {t('price_label')}
                      : $
                      {pricePreview?.toFixed(2)}
                      {' '}
                      MXN
                    </p>
                  )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
            {t('notes_label')}
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder={t('notes_placeholder')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-md p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? t('submitting') : t('submit_button')}
        </button>
      </form>
    </div>
  );
}
