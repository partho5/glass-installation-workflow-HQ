'use client';

import { useState } from 'react';

type TestResult = {
  success: boolean;
  fileType?: string;
  mode?: string;
  url?: string;
  public_id?: string;
  resource_type?: string;
  bytes?: number;
  serverAccess?: string;
  note?: string;
  error?: string;
  details?: any;
};

type UploadMode = 'signed' | 'unsigned';
type FileType = 'image' | 'pdf';

export default function CloudinaryDebugPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function runTest(fileType: FileType, mode: UploadMode) {
    setLoading(true);
    try {
      const res = await fetch('/api/debug/cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: fileType, mode }),
      });
      const data = await res.json();
      setResults(prev => [{ ...data, fileType, mode }, ...prev]);
    } catch (err: any) {
      setResults(prev => [{ success: false, error: err.message, fileType, mode }, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setResults([]);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h1 className="mb-1 text-2xl font-bold">Cloudinary Debug Tool</h1>
          <p className="mb-6 text-sm text-gray-500">
            Tests upload + server-side download for images and PDFs. Check the URL column to
            manually test browser access.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => runTest('image', 'unsigned')}
              className="rounded-lg bg-blue-100 px-4 py-3 text-sm font-medium text-blue-800 hover:bg-blue-200 disabled:opacity-50"
            >
              Image — Unsigned
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTest('image', 'signed')}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Image — Signed
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTest('pdf', 'unsigned')}
              className="rounded-lg bg-orange-100 px-4 py-3 text-sm font-medium text-orange-800 hover:bg-orange-200 disabled:opacity-50"
            >
              PDF — Unsigned
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => runTest('pdf', 'signed')}
              className="rounded-lg bg-orange-600 px-4 py-3 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              PDF — Signed
            </button>
          </div>

          {loading && (
            <p className="mt-4 text-sm text-gray-500">Running test...</p>
          )}
        </div>

        {results.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Results</h2>
              <button
                type="button"
                onClick={clearResults}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </div>

            <div className="space-y-4">
              {results.map((r, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={`rounded-lg border p-4 text-sm ${r.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className={`font-bold ${r.success ? 'text-green-700' : 'text-red-700'}`}>
                      {r.success ? 'PASS' : 'FAIL'}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">
                      {r.fileType?.toUpperCase()}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs ${r.mode === 'signed' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {r.mode}
                    </span>
                  </div>

                  {r.error && (
                    <p className="mb-2 font-medium text-red-700">
                      Error:
                      {' '}
                      {r.error}
                    </p>
                  )}

                  {r.url && (
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">URL: </span>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-blue-600 underline hover:text-blue-800"
                      >
                        {r.url}
                      </a>
                    </div>
                  )}

                  {r.serverAccess && (
                    <div className="mb-1">
                      <span className="font-medium text-gray-700">Server access: </span>
                      <span
                        className={r.serverAccess.startsWith('OK') ? 'text-green-700' : 'text-red-700'}
                      >
                        {r.serverAccess}
                      </span>
                    </div>
                  )}

                  {r.public_id && (
                    <div className="text-gray-500">
                      public_id:
                      {' '}
                      <span className="font-mono">{r.public_id}</span>
                      {' '}
                      | resource_type:
                      {' '}
                      <span className="font-mono">{r.resource_type}</span>
                      {' '}
                      | bytes:
                      {' '}
                      {r.bytes}
                    </div>
                  )}

                  {r.note && (
                    <p className="mt-1 text-xs text-gray-500">{r.note}</p>
                  )}

                  {r.details && (
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                      {JSON.stringify(r.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
