'use client';

import { useState } from 'react';

export function DatabaseCard({ db }: { db: any }) {
  const [copied, setCopied] = useState(false);
  const title = db.title?.[0]?.plain_text || 'Untitled';
  const dbId = db.id.replace(/-/g, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dbId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md transition-all hover:border-purple-300 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Last edited:
            {' '}
            {new Date(db.last_edited_time).toLocaleDateString()}
            {' '}
            •
            {' '}
            {Object.keys(db.properties || {}).length}
            {' '}
            properties
          </p>
        </div>
        <a
          href={db.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Open →
        </a>
      </div>

      {/* Database ID for .env file */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-purple-700">
          Database ID (copy this to your .env file)
        </label>
        <div className="flex gap-2">
          <code className="flex-1 rounded-lg bg-purple-50 px-4 py-3 font-mono text-sm text-purple-900">
            {dbId}
          </code>
          <button
            type="button"
            onClick={copyToClipboard}
            className={`min-w-[100px] rounded-lg px-4 py-2 font-semibold text-white transition-all ${
              copied
                ? 'bg-green-600 scale-105'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
