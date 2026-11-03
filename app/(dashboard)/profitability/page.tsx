'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Search
} from 'lucide-react';

export default function ProfitabilityPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/profitability')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Overall financial summary
  const totalRevenue = projects.reduce((acc, p) => acc + p.financials.effectiveRevenue, 0);
  const totalCosts = projects.reduce((acc, p) => acc + p.financials.totalProjectCost, 0);
  const totalNetProfit = totalRevenue - totalCosts;
  const overallMargin = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : '0';

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
            <TrendingUp className="w-4 h-4" /> Financial Analysis • Module 12
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Project Cost & Profitability Analyzer</h1>
          <p className="text-xs text-slate-400">
            Compare project revenue (client payments + approved extra work) against vendor payouts & site expenses.
          </p>
        </div>
      </div>

      {/* Financial Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Realized Revenue</span>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{formatINR(totalRevenue)}</h3>
          <p className="text-[11px] text-emerald-400 mt-1">Client Collections + Variations</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Outflow Expenses</span>
          <h3 className="text-2xl font-bold text-slate-100 mt-2">{formatINR(totalCosts)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Vendors + Site Materials</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30">
          <span className="text-xs text-amber-400 font-medium">Net Profit Across Sites</span>
          <h3 className="text-2xl font-bold text-gold-gradient mt-2">{formatINR(totalNetProfit)}</h3>
          <p className="text-[11px] text-amber-400 mt-1">Net Cash Margin</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Overall Profit Margin %</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2">{overallMargin}%</h3>
          <p className="text-[11px] text-slate-400 mt-1">Target Margin &gt; 25%</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project title, client, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Project Profitability Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Project Title & Client</th>
              <th className="p-4 font-bold text-slate-200">Contract Budget</th>
              <th className="p-4 font-bold text-blue-400">Total Collected</th>
              <th className="p-4">Vendor Payouts</th>
              <th className="p-4">Site Expenses</th>
              <th className="p-4 font-bold text-rose-400">Total Costs</th>
              <th className="p-4 font-bold text-emerald-400">Net Profit</th>
              <th className="p-4 text-right font-bold text-amber-400">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((p) => {
              const f = p.financials;
              const isLowMargin = f.profitMarginPct < 20;

              return (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-100">{p.title}</div>
                    <div className="text-[10px] text-slate-400">{p.clientName} • {p.projectNumber}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-300">{formatINR(p.budget)}</td>
                  <td className="p-4 font-bold text-blue-400">{formatINR(f.totalCollected)}</td>
                  <td className="p-4 font-mono text-slate-400">{formatINR(f.vendorPayouts)}</td>
                  <td className="p-4 font-mono text-slate-400">{formatINR(f.siteExpenses)}</td>
                  <td className="p-4 font-bold text-rose-400">{formatINR(f.totalProjectCost)}</td>
                  <td className="p-4 font-bold text-emerald-400">{formatINR(f.netProfit)}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isLowMargin
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {f.profitMarginPct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
