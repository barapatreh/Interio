'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  FileText,
  Palette,
  Briefcase,
  Truck,
  Receipt,
  CreditCard,
  DollarSign,
  PlusCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  User,
  LayoutGrid,
  LifeBuoy,
  Calendar,
  Notebook,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>('MASTER_ADMIN');

  useEffect(() => {
    const storedUser = localStorage.getItem('interio_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?.role) setRole(u.role);
      } catch (e) {}
    }
  }, []);

  const navSections = [
    {
      title: 'CORE DASHBOARD',
      items: [
        { label: 'Command Center', href: '/', icon: LayoutDashboard, roles: ['MASTER_ADMIN', 'ADMIN', 'SALES', 'DESIGNER', 'PROJECT_MANAGER', 'ACCOUNTANT'] },
        { label: 'Lead CRM', href: '/leads', icon: Users, roles: ['MASTER_ADMIN', 'ADMIN', 'SALES'] },
        { label: 'Client Directory', href: '/clients', icon: UserCheck, roles: ['MASTER_ADMIN', 'ADMIN', 'SALES', 'ACCOUNTANT'] }
      ]
    },
    {
      title: 'SALES & DESIGN',
      items: [
        { label: 'Service Catalogue', href: '/catalogue', icon: BookOpen, roles: ['MASTER_ADMIN', 'ADMIN', 'SALES', 'DESIGNER'] },
        { label: 'Client Requirements', href: '/requirements', icon: Notebook, roles: ['MASTER_ADMIN', 'ADMIN', 'SALES', 'DESIGNER'] },
        { label: 'Proposals / BOQ', href: '/quotations', icon: FileText, roles: ['MASTER_ADMIN', 'ADMIN', 'SALES'] },
        { label: '3D Renders & CAD', href: '/designs', icon: Palette, roles: ['MASTER_ADMIN', 'ADMIN', 'DESIGNER', 'PROJECT_MANAGER'] }
      ]
    },
    {
      title: 'OPERATIONS & SITES',
      items: [
        { label: 'Fitout Projects', href: '/projects', icon: Briefcase, roles: ['MASTER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'DESIGNER', 'ACCOUNTANT'] },
        { label: 'Work Calendar', href: '/calendar', icon: Calendar, roles: ['MASTER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'DESIGNER', 'SALES'] },
        { label: 'Vendor Directory', href: '/vendors', icon: Truck, roles: ['MASTER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'ACCOUNTANT'] }
      ]
    },
    {
      title: 'FINANCIALS & BILLING',
      items: [
        { label: 'Tax Invoices', href: '/invoices', icon: Receipt, roles: ['MASTER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
        { label: 'Extra Scope (VO)', href: '/extra-work', icon: PlusCircle, roles: ['MASTER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'ACCOUNTANT'] },
        { label: 'Vendor Payments', href: '/vendor-payments', icon: CreditCard, roles: ['MASTER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
        { label: 'Site Expenses', href: '/expenses', icon: DollarSign, roles: ['MASTER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'PROJECT_MANAGER'] },
        { label: 'Project Margins', href: '/profitability', icon: TrendingUp, roles: ['MASTER_ADMIN', 'ADMIN', 'ACCOUNTANT'] }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Company Reports', href: '/reports', icon: BarChart3, roles: ['MASTER_ADMIN', 'ADMIN'] },
        { label: 'Platform Settings', href: '/settings', icon: Settings, roles: ['MASTER_ADMIN', 'ADMIN'] }
      ]
    }
  ];

  const portalItems = [
    { label: 'My Project Status', href: '/client-portal', icon: LayoutGrid, roles: ['CLIENT'] },
    { label: 'My Contracts & POs', href: '/vendor-portal', icon: Truck, roles: ['VENDOR'] }
  ];

  const isClientOrVendor = role === 'CLIENT' || role === 'VENDOR';

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#090d16] border-r border-slate-800/80 flex flex-col h-full select-none transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:w-64 md:z-auto
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/30">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-extrabold text-gold-gradient tracking-wide block leading-none">
              INTERIO
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase block mt-1">
              Architecture ERP
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
          <span>{role} Navigation</span>
          <ShieldCheck className="w-3 h-3 text-amber-400" />
        </div>

        {isClientOrVendor ? (
          <div className="space-y-1">
            {portalItems
              .filter((item) => item.roles.includes(role))
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 font-bold border border-amber-500/30 shadow-md shadow-amber-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>
        ) : (
          navSections.map((section) => {
            const filteredItems = section.items.filter((item) => item.roles.includes(role) || (role === 'MASTER_ADMIN' && item.roles.includes('MASTER_ADMIN')));
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                  {section.title}
                </p>
                {filteredItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 font-bold border border-amber-500/30 shadow-md shadow-amber-500/5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}
