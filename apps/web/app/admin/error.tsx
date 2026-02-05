'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin route error:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Admin error</h2>
      <pre style={{ overflow: 'auto', background: '#f5f5f5', padding: '1rem' }}>
        {error.message}
      </pre>
      <button
        type="button"
        onClick={reset}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
      >
        Try again
      </button>
    </div>
  );
}
