'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, Lock, Mail, ArrowRight, Building, Key, UserCheck, Truck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@interio.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Save user session & companies in localStorage
      localStorage.setItem('interio_user', JSON.stringify(data.user));
      localStorage.setItem('interio_companies', JSON.stringify(data.companies));
      if (data.companies && data.companies.length > 0) {
        localStorage.setItem('interio_active_company', JSON.stringify(data.companies[0]));
      }

      // Redirect based on role
      if (data.user?.role === 'CLIENT') {
        router.push('/client-portal');
      } else if (data.user?.role === 'VENDOR') {
        router.push('/vendor-portal');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Connection error');
      setLoading(false);
    }
  };

  const setPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Architectural Interior Overlay Image */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center filter blur-sm scale-105" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-[#070b14]/90" />

      {/* Radiant Golden Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="glass-card w-full max-w-md rounded-3xl border border-amber-500/30 p-8 sm:p-10 space-y-7 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 border border-amber-300/40">
            <Sparkles className="w-9 h-9 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gold-gradient tracking-wide">INTERIO</h1>
            <p className="text-xs text-amber-400/90 font-semibold uppercase tracking-widest mt-1">
              Architecture & Fitout Platform
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@interio.com"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-2 transform active:scale-95"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
