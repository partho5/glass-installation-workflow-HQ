'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

export function DashboardTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'create';
  const t = useTranslations('DashboardTabs');

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
          <span>{t('create_order')}</span>
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
          <span>{t('all_orders')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('crew')}
          className={`
            flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors
            ${currentView === 'crew'
      ? 'border-orange-500 text-orange-600'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }
          `}
        >
          <span className="text-lg">👥</span>
          <span>{t('crew_management')}</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('billing')}
          className={`
            flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors
            ${currentView === 'billing'
      ? 'border-purple-500 text-purple-600'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }
          `}
        >
          <span className="text-lg">💰</span>
          <span>{t('billing')}</span>
        </button>
      </nav>
    </div>
  );
}
