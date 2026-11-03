'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-slate-100 select-none">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-amber-500/30 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">Temporary Runtime Exception</h2>
          <p className="text-xs text-slate-400 mt-1">
            An internal runtime error occurred. Please try reloading or clearing local session cache.
          </p>

          {error?.message && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
              <p className="text-[11px] font-mono text-rose-300 break-words">{error.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Reload Component
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Reset Session & Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
