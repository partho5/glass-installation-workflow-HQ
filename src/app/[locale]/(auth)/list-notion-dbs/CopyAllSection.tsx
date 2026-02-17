'use client';

import { useState } from 'react';

interface CopyAllSectionProps {
  databases: any[];
}

// Smart matching - tries multiple variations
function guessEnvVar(title: string): string | null {
  const normalized = title.toLowerCase().trim();

  if (normalized.includes('order')) return 'NOTION_ORDERS_DB_ID';
  if (normalized.includes('client')) return 'NOTION_CLIENTS_DB_ID';
  if (normalized.includes('truck') || normalized.includes('model')) return 'NOTION_TRUCK_MODELS_DB_ID';
  if (normalized.includes('glass') && normalized.includes('part')) return 'NOTION_GLASS_PARTS_DB_ID';
  if (normalized.includes('inventor')) return 'NOTION_INVENTORY_DB_ID';
  if (normalized.includes('crew')) return 'NOTION_CREWS_DB_ID';
  if (normalized.includes('pric')) return 'NOTION_PRICING_DB_ID';

  return null;
}

export function CopyAllSection({ databases }: CopyAllSectionProps) {
  const [copied, setCopied] = useState(false);

  // Map ALL databases to env format with smart matching
  const allMappings = databases.map((db: any) => {
    const title = db.title?.[0]?.plain_text || 'Untitled';
    const dbId = db.id.replace(/-/g, '');
    const envVar = guessEnvVar(title);

    return { title, dbId, envVar, matched: !!envVar };
  });

  // Create env text from matched databases
  const matchedLines = allMappings
    .filter(m => m.matched && m.envVar)
    .map(m => `${m.envVar}=${m.dbId}`);

  // Also show unmatched databases as comments
  const unmatchedLines = allMappings
    .filter(m => !m.matched)
    .map(m => `# ${m.title}=${m.dbId}`);

  const allEnvText = [...matchedLines, ...unmatchedLines].join('\n');
  const hasAllRequired = matchedLines.length === 7;

  const copyAll = () => {
    navigator.clipboard.writeText(allEnvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (allMappings.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold">
            Ready to Copy - All Database IDs
          </h2>
          <p className="text-purple-100">
            {hasAllRequired
              ? '✅ All 7 required databases found and matched!'
              : `✅ Matched ${matchedLines.length}/7 databases. ${unmatchedLines.length > 0 ? `(${unmatchedLines.length} unmatched shown as comments)` : ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={copyAll}
          className={`min-w-[140px] rounded-xl px-6 py-3 font-bold text-lg shadow-lg transition-all ${
            copied
              ? 'bg-green-500 scale-110'
              : 'bg-white text-purple-600 hover:bg-purple-50 hover:scale-105'
          }`}
        >
          {copied ? '✓ Copied All!' : 'Copy All'}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-xl bg-gray-900 p-6 font-mono text-sm text-green-400">
        {allEnvText || '# No matching databases found'}
      </pre>

      {!hasAllRequired && (
        <div className="mt-4 rounded-lg bg-yellow-500/20 p-4 text-yellow-100">
          <p className="font-semibold">
            💡 Database Name Matching
          </p>
          <p className="mt-2 text-sm">
            Found databases: {allMappings.map(m => m.title).join(', ')}
          </p>
          <p className="mt-2 text-sm">
            {unmatchedLines.length > 0 && (
              <>Unmatched databases are shown as comments (# prefix). You can manually assign them to the correct variable names in your .env file.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
