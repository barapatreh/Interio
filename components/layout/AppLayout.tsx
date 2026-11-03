'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login';

  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <main className="min-h-screen w-full bg-[#090d16] text-slate-100 overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="h-full flex overflow-hidden text-slate-100 antialiased bg-[#090d16]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#090d16]">
          {children}
        </main>
      </div>
    </div>
  );
}
