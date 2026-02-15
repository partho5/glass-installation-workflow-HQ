'use client';

import { useState } from 'react';

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
  const [formData, setFormData] = useState({
    clientId: '',
    unitNumber: '',
    truckModelId: '',
    glassPosition: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      setMessage({
        type: 'success',
        text: `Order created successfully! Order ID: ${result.orderId}`,
      });

      // Reset form
      setFormData({
        clientId: '',
        unitNumber: '',
        truckModelId: '',
        glassPosition: '',
        notes: '',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create order',
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

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">New Order Intake</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client */}
        <div>
          <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-gray-700">
            Client
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
            <option value="">Select a client</option>
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
            Unit Number
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
            placeholder="e.g., TRK-001"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Truck Model */}
        <div>
          <label htmlFor="truckModelId" className="mb-1 block text-sm font-medium text-gray-700">
            Truck Model
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
            <option value="">Select a truck model</option>
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
            Glass Position
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
            <option value="">Select glass position</option>
            {glassPositions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Add any additional notes..."
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
          {loading ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
