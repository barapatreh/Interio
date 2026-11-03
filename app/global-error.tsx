'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', itemsCenter: 'center', justifyCenter: 'center', padding: '2rem' }}>
        <div style={{ background: 'rgba(19, 27, 46, 0.9)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '2rem', borderRadius: '1rem', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d4af37' }}>Interio System Recovery</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>An error occurred while loading application state.</p>
          <button
            onClick={() => reset()}
            style={{ marginTop: '1.5rem', background: '#d4af37', color: '#090d16', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
