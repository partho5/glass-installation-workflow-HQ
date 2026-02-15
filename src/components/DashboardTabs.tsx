'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function DashboardTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'create';

  const handleTabChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'create') {
      params.delete('view');
      params.delete('status');
    } else {
      params.set('view', view);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="-mb-px flex" aria-label="Main Tabs">
        <button
          type="button"
          onClick={() => handleTabChange('create')}
          className={`
            flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors
            ${currentView === 'create'
      ? 'border-green-500 text-green-600'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }
          `}
        >
          <span className="text-lg">➕</span>
          <span>Create Order</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('orders')}
          className={`
            flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors
            ${currentView === 'orders'
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }
          `}
        >
          <span className="text-lg">📋</span>
          <span>All Orders</span>
        </button>
      </nav>
    </div>
  );
}
