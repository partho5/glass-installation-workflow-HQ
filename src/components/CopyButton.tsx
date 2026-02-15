'use client';

import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
      type="button"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
