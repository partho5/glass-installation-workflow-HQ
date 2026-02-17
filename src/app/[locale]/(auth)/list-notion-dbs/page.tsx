import type { Metadata } from 'next';
import { Client } from '@notionhq/client';
import { DatabaseCard } from './DatabaseCard';
import { CopyAllSection } from './CopyAllSection';

export const metadata: Metadata = {
  title: 'Notion Database IDs - Setup Helper',
  description: 'Get your Notion database IDs for environment configuration',
};

async function getNotionDatabases() {
  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'data_source',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    return { success: true, results: response.results, error: null };
  }
  catch (error: any) {
    console.error('Error fetching Notion databases:', error);
    return {
      success: false,
      results: null,
      error: error?.message || 'Unknown error',
      details: error?.body || error?.toString() || 'No details available'
    };
  }
}

export default async function ListNotionDatabasesPage() {
  const result = await getNotionDatabases();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-3xl font-bold text-red-600">
              ⚠️ Error Loading Databases
            </h1>
            <p className="text-gray-700">
              Could not connect to Notion API. Please check:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <code className="rounded bg-gray-100 px-2 py-1">NOTION_API_KEY</code>
                {' '}
                is set in your
                {' '}
                <code className="rounded bg-gray-100 px-2 py-1">.env</code>
                {' '}
                file
              </li>
              <li>The API key has access to your workspace</li>
              <li>Your integration is connected to the databases</li>
            </ul>

            {/* Show actual error */}
            <div className="mt-6 rounded-lg bg-red-50 p-4">
              <p className="mb-2 font-bold text-red-900">Error Details:</p>
              <code className="block rounded bg-red-100 p-3 text-sm text-red-800">
                {result.error}
              </code>
              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-semibold text-red-900">
                    Full Error Details
                  </summary>
                  <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-3 text-xs text-red-800">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const databases = result.results || [];

  if (databases.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-3xl font-bold text-yellow-600">
              📋 No Databases Found
            </h1>
            <p className="text-gray-700">
              No databases are shared with your Notion integration.
            </p>
            <div className="mt-6 rounded-lg bg-yellow-50 p-6">
              <h2 className="mb-3 font-bold text-yellow-900">
                To fix this:
              </h2>
              <ol className="list-decimal space-y-2 pl-6 text-gray-700">
                <li>Open your Notion workspace</li>
                <li>Go to each database you want to use</li>
                <li>
                  Click the
                  {' '}
                  <strong>••• menu</strong>
                  {' '}
                  → Select
                  {' '}
                  <strong>Add connections</strong>
                </li>
                <li>Choose your integration and click Allow</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl">
          <h1 className="mb-2 text-4xl font-bold">
            📊 Notion Database IDs
          </h1>
          <p className="text-blue-100">
            Copy these IDs to your
            {' '}
            <code className="rounded bg-white/20 px-2 py-1">.env</code>
            {' '}
            file
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <span className="text-2xl">💡</span>
            How to Use
          </h2>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700">
            <li>
              Find the database you need below (Orders, Clients, Truck Models, etc.)
            </li>
            <li>Click the "Copy ID" button to copy the database ID</li>
            <li>
              Paste it into your
              {' '}
              <code className="rounded bg-gray-100 px-2 py-1">.env</code>
              {' '}
              file next to the corresponding variable
            </li>
            <li>Repeat for all 7 required databases</li>
          </ol>
        </div>

        {/* Required Databases Checklist */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-green-900 to-teal-900 p-6 text-white shadow-lg">
          <h2 className="mb-4 text-xl font-bold">
            ✅ Required Databases (7 total)
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: 'Orders', var: 'NOTION_ORDERS_DB_ID', icon: '📝' },
              { name: 'Clients', var: 'NOTION_CLIENTS_DB_ID', icon: '👥' },
              { name: 'Truck Models', var: 'NOTION_TRUCK_MODELS_DB_ID', icon: '🚚' },
              { name: 'Glass Parts', var: 'NOTION_GLASS_PARTS_DB_ID', icon: '🪟' },
              { name: 'Inventory', var: 'NOTION_INVENTORY_DB_ID', icon: '📦' },
              { name: 'Crews', var: 'NOTION_CREWS_DB_ID', icon: '👷' },
              { name: 'Pricing', var: 'NOTION_PRICING_DB_ID', icon: '💰' },
            ].map(db => (
              <div
                key={db.var}
                className="flex items-center gap-3 rounded-lg bg-white/20 p-3 backdrop-blur"
              >
                <span className="text-2xl">{db.icon}</span>
                <div>
                  <div className="font-semibold">{db.name}</div>
                  <code className="text-xs text-green-100">{db.var}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Databases (
            {databases.length}
            )
          </h2>

          {databases.map((db: any) => (
            <DatabaseCard key={db.id} db={db} />
          ))}
        </div>

        {/* Copy All Section */}
        <CopyAllSection databases={databases} />

        {/* Footer Help */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          
          
        </div>
      </div>
    </div>
  );
}
