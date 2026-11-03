'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building, Shield, Bell, LogOut, ChevronDown, Plus, Sun, Moon, Menu, X } from 'lucide-react';

interface HeaderProps {
  isMobileOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function Header({ isMobileOpen, onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('interio_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }

    // Load session info from localStorage
    const storedUser = localStorage.getItem('interio_user');
    const storedCompanies = localStorage.getItem('interio_companies');
    const storedActiveCompany = localStorage.getItem('interio_active_company');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
    if (storedActiveCompany) {
      setActiveCompany(JSON.parse(storedActiveCompany));
    } else if (storedCompanies) {
      const parsed = JSON.parse(storedCompanies);
      if (parsed.length > 0) {
        setActiveCompany(parsed[0]);
        localStorage.setItem('interio_active_company', JSON.stringify(parsed[0]));
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('interio_theme', nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
  };

  const handleSelectCompany = (comp: any) => {
    setActiveCompany(comp);
    localStorage.setItem('interio_active_company', JSON.stringify(comp));
    setShowCompanyDropdown(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('interio_user');
    localStorage.removeItem('interio_active_company');
    router.push('/login');
  };

  return (
    <header className="h-16 bg-[#0d1424]/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Mobile Hamburger Toggle & Multi-Company Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-amber-400 transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* Multi-Company Dropdown Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-900 border border-amber-500/30 hover:border-amber-500 rounded-xl text-xs transition-colors"
          >
            <Building className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <p className="font-bold text-slate-100 truncate max-w-[100px] sm:max-w-[160px]">
                {activeCompany?.name || 'All Companies'}
              </p>
              <p className="text-[9px] text-amber-400 font-mono leading-none mt-0.5">{activeCompany?.code || 'INT-CORP'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showCompanyDropdown && (
            <div className="absolute left-0 mt-2 w-72 bg-[#131b2e] border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800 flex justify-between items-center">
                <span>Multi-Company Setup</span>
                <span className="text-amber-400 font-mono">{companies.length} Registered</span>
              </div>

              {/* All Companies Global Option */}
              <button
                onClick={() => handleSelectCompany({ id: 'ALL', name: 'All Companies (Global View)', code: 'INT-CORP' })}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors border-b border-slate-800/80 ${
                  activeCompany?.id === 'ALL' || !activeCompany?.id ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-200 font-semibold'
                }`}
              >
                <div>
                  <p className="font-bold flex items-center gap-1.5">
                    <span>🌟 All Companies (Global View)</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Consolidated Group Dashboard</p>
                </div>
              </button>

              {companies.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompany(comp)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    activeCompany?.id === comp.id ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-bold">{comp.name}</p>
                    <p className="text-[10px] text-slate-400">{comp.code}</p>
                  </div>
                </button>
              ))}

              <div className="p-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowCompanyDropdown(false);
                    router.push('/settings?tab=create-company');
                  }}
                  className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Register New Company
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search Bar (Hidden on Mobile) */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, clients, quotations..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Right User & Role Switcher + Light/Dark Theme Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl text-amber-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-400" />}
          <span className="hidden xl:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Role Badge (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-amber-300 text-[11px]">{user?.role || 'ADMIN'}</span>
        </div>

        {/* User Profile & Logout Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 sm:pl-2 border-l border-slate-800 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md shadow-amber-500/20">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200">{user?.name || 'Master Admin'}</p>
              <p className="text-[10px] text-slate-400">{user?.email || 'admin@interio.com'}</p>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#131b2e] border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-100">{user?.name}</p>
                <p className="text-[10px] text-amber-400">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
