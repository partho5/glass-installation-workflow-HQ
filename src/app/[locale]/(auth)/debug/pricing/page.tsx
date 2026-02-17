'use client';

import { useEffect, useState } from 'react';

type PricingRow = {
  id: string;
  client: string;
  clientId: string;
  truckModel: string;
  truckId: string;
  glassPosition: string;
  price: number;
};

type GroupedData = Record<string, PricingRow[]>;

export default function PricingDebugPage() {
  const [data, setData] = useState<{
    total: number;
    grouped: GroupedData;
    raw: PricingRow[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/debug/pricing');
        if (!res.ok) {
          throw new Error('Failed to fetch');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading pricing data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-red-800">
          Error:
          {' '}
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const filteredData = data.raw.filter(
    row =>
      row.client.toLowerCase().includes(searchTerm.toLowerCase())
      || row.truckModel.toLowerCase().includes(searchTerm.toLowerCase())
      || row.glassPosition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h1 className="mb-2 text-3xl font-bold">🔍 Pricing Table Debug</h1>
          <p className="text-gray-600">
            Total pricing rows:
            {' '}
            <span className="font-semibold">{data.total}</span>
          </p>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by client, truck, or glass position..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        {/* Missing Glass Positions Warning */}
        <div className="mb-6 rounded-lg bg-yellow-50 p-6 shadow">
          <h2 className="mb-3 text-xl font-bold text-yellow-900">
            ⚠️ Expected Glass Positions
          </h2>
          <p className="mb-2 text-sm text-yellow-800">
            Each Client + Truck Model combination should have pricing for all 4 glass positions:
          </p>
          <div className="flex gap-2">
            <span className="rounded bg-yellow-200 px-3 py-1 text-sm font-medium">
              Parabrisas
            </span>
            <span className="rounded bg-yellow-200 px-3 py-1 text-sm font-medium">
              Lateral Izq
            </span>
            <span className="rounded bg-yellow-200 px-3 py-1 text-sm font-medium">
              Lateral Der
            </span>
            <span className="rounded bg-yellow-200 px-3 py-1 text-sm font-medium">
              Trasero
            </span>
          </div>
        </div>

        {/* All Pricing Rows */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            All Pricing Rows (
            {filteredData.length}
            )
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Truck Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Glass Position
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredData.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {row.client}
                      <div className="text-xs text-gray-400">
                        {row.clientId.slice(0, 8)}
                        ...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {row.truckModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-1 text-sm font-medium ${
                          row.glassPosition === 'Parabrisas'
                            ? 'bg-blue-100 text-blue-800'
                            : row.glassPosition === 'Lateral Izq'
                              ? 'bg-green-100 text-green-800'
                              : row.glassPosition === 'Lateral Der'
                                ? 'bg-purple-100 text-purple-800'
                                : row.glassPosition === 'Trasero'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.glassPosition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-gray-900">
                      $
                      {row.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <p className="py-8 text-center text-gray-500">
              No pricing rows found matching your search.
            </p>
          )}
        </div>

        {/* Grouped by Client */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Grouped by Client</h2>
          {Object.entries(data.grouped).map(([client, rows]) => (
            <details key={client} className="mb-4 border-b pb-4">
              <summary className="cursor-pointer text-lg font-semibold hover:text-purple-600">
                {client}
                {' '}
                (
                {rows.length}
                {' '}
                rows)
              </summary>
              <div className="mt-2 ml-4 space-y-1">
                {rows.map(row => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                  >
                    <span className="text-gray-600">{row.truckModel}</span>
                    <span className="font-medium">{row.glassPosition}</span>
                    <span className="font-bold text-green-700">
                      $
                      {row.price}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
