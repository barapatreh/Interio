'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Building,
  UserCheck,
  DollarSign
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Quick Convert form
  const [convertForm, setConvertForm] = useState({
    clientId: '',
    title: '',
    siteAddress: '',
    budget: ''
  });

  const fetchCompanyData = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) {
            setActiveCompany(comp);
            compId = comp.id;
          }
        } catch (e) {}
      }

      const pUrl = compId ? `/api/projects?companyId=${compId}` : '/api/projects';
      const cUrl = compId ? `/api/clients?companyId=${compId}` : '/api/clients';

      const [pRes, cRes] = await Promise.all([fetch(pUrl), fetch(cUrl)]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);

      if (Array.isArray(pData)) setProjects(pData);
      if (Array.isArray(cData)) setClients(cData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleConvertClientToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertForm.clientId) {
      alert('Please select a client to convert');
      return;
    }

    try {
      const res = await fetch(`/api/clients/${convertForm.clientId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompany?.id,
          title: convertForm.title,
          siteAddress: convertForm.siteAddress,
          budget: convertForm.budget
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Client successfully converted into Fitout Project!');
        setShowConvertModal(false);
        setConvertForm({ clientId: '', title: '', siteAddress: '', budget: '' });
        fetchCompanyData();
      } else {
        alert(data.error || 'Failed to convert client to project');
      }
    } catch (error) {
      console.error(error);
      alert('Error converting client to project');
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> Site Fitouts • Module 6
            {activeCompany && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                {activeCompany.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Project Management & Milestones</h1>
          <p className="text-xs text-slate-400">
            Converted fitout projects, site timeline milestones, work breakdown & documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConvertModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Convert Client to Fitout Project
          </button>
          <Link
            href="/quotations"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-all"
          >
            <Briefcase className="w-4 h-4 text-amber-400" /> View Quotes
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project number, title, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-amber-400">{filteredProjects.length}</span> Active Projects
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Fitout Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No projects matched your active company filter ({activeCompany?.name || 'All'}). Click below to convert any active client into a Fitout Project.
          </p>
          <button
            onClick={() => setShowConvertModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Convert Client to Project Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div key={p.id} className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 flex flex-col justify-between border border-slate-800">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">{p.projectNumber}</span>
                    <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
                    {p.company && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Company: {p.company.name}</span>
                    )}
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-200 font-semibold">{p.client?.name || 'Unassigned Client'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{p.siteAddress}</span>
                  </div>
                  {p.targetEndDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Target End: {new Date(p.targetEndDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Site Completion</span>
                    <span className="font-bold text-amber-400">{p.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${p.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Financial Snapshot */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 bg-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500">Agreed Budget</span>
                    <p className="font-bold text-slate-200">{formatINR(p.budget)}</p>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-xl">
                    <span className="text-[10px] text-slate-500">Milestones</span>
                    <p className="font-bold text-amber-400">{p.milestones?.length || 0} Phases</p>
                  </div>
                </div>
              </div>

              <Link
                href={`/projects/${p.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 rounded-xl text-xs font-semibold transition-colors"
              >
                Open Site Command View <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* CONVERT CLIENT TO FITOUT PROJECT MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" /> Convert Client into Fitout Project
                </h3>
                {activeCompany && (
                  <p className="text-[11px] text-amber-400">Target Company: {activeCompany.name}</p>
                )}
              </div>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleConvertClientToProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Client Profile *</label>
                <select
                  required
                  value={convertForm.clientId}
                  onChange={(e) => {
                    const selectedC = clients.find((c) => c.id === e.target.value);
                    setConvertForm({
                      ...convertForm,
                      clientId: e.target.value,
                      title: selectedC ? `${selectedC.name} Turnkey Fitout` : '',
                      siteAddress: selectedC ? selectedC.address || selectedC.city || '' : '',
                      budget: selectedC?.budget ? String(selectedC.budget) : ''
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:border-amber-500"
                >
                  <option value="">-- Choose Client Profile --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.propertyType || 'Client'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Project Title *</label>
                <input
                  type="text"
                  required
                  value={convertForm.title}
                  onChange={(e) => setConvertForm({ ...convertForm, title: e.target.value })}
                  placeholder="e.g. Hemant Residence - 3BHK Luxury Fitout"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Site Work Address *</label>
                <input
                  type="text"
                  required
                  value={convertForm.siteAddress}
                  onChange={(e) => setConvertForm({ ...convertForm, siteAddress: e.target.value })}
                  placeholder="Flat 1802, Wadhwa Wise City, Panvel, Mumbai"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Agreed Fitout Budget (₹) *</label>
                <input
                  type="number"
                  required
                  value={convertForm.budget}
                  onChange={(e) => setConvertForm({ ...convertForm, budget: e.target.value })}
                  placeholder="2500000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Convert to Active Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
