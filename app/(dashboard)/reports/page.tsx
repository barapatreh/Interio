'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Calendar,
  Briefcase,
  DollarSign,
  PieChart,
  Users,
  Printer
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'sales' | 'projects' | 'profit' | 'ar' | 'ap' | 'expenses'>('sales');

  const [leads, setLeads] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const fetchReportsData = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const [lRes, qRes, pRes, iRes, eRes, vRes] = await Promise.all([
        fetch(compId ? `/api/leads?companyId=${compId}` : '/api/leads').then((r) => r.json()),
        fetch(compId ? `/api/quotations?companyId=${compId}` : '/api/quotations').then((r) => r.json()),
        fetch(compId ? `/api/projects?companyId=${compId}` : '/api/projects').then((r) => r.json()),
        fetch(compId ? `/api/invoices?companyId=${compId}` : '/api/invoices').then((r) => r.json()),
        fetch(compId ? `/api/expenses?companyId=${compId}` : '/api/expenses').then((r) => r.json()),
        fetch(compId ? `/api/vendors?companyId=${compId}` : '/api/vendors').then((r) => r.json())
      ]);

      if (Array.isArray(lRes)) setLeads(lRes);
      if (Array.isArray(qRes)) setQuotations(qRes);
      if (Array.isArray(pRes)) setProjects(pRes);
      if (Array.isArray(iRes)) setInvoices(iRes);
      if (Array.isArray(eRes)) setExpenses(eRes);
      if (Array.isArray(vRes)) setVendors(vRes);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Sales Metrics
  const totalProposalValue = quotations.reduce((s, q) => s + (q.grandTotal || 0), 0);
  const acceptedProposals = quotations.filter((q) => q.status === 'Accepted').length;
  const conversionRate = quotations.length > 0 ? ((acceptedProposals / quotations.length) * 100).toFixed(1) : '0';

  // P&L Metrics
  const totalBilled = invoices.reduce((s, i) => s + (i.totalAmount || i.amount || 0), 0);
  const totalDirectCosts = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const grossProfit = totalBilled - totalDirectCosts;
  const netMarginPct = totalBilled > 0 ? ((grossProfit / totalBilled) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Executive Reports & BI Analytics</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Module 15
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-company executive reports for sales conversions, project progress, P&L, AR/AP aging, and procurement.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
        >
          <Printer className="w-4 h-4" /> Export / Print Report
        </button>
      </div>

      {/* High Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed Revenue</span>
          <span className="text-xl font-bold text-slate-100 font-mono block mt-1">{formatINR(totalBilled)}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Project Costs</span>
          <span className="text-xl font-bold text-rose-400 font-mono block mt-1">{formatINR(totalDirectCosts)}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Net Profit</span>
          <span className="text-xl font-bold text-emerald-400 font-mono block mt-1">{formatINR(grossProfit)}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <span className="text-[10px] uppercase font-bold text-amber-400">Quote Conversion Rate</span>
          <span className="text-xl font-bold text-amber-300 font-mono block mt-1">{conversionRate}%</span>
        </div>
      </div>

      {/* REPORT SELECTOR TABS */}
      <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-semibold overflow-x-auto pb-3">
        <button
          onClick={() => setActiveReport('sales')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReport === 'sales' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Sales & Proposals
        </button>

        <button
          onClick={() => setActiveReport('projects')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReport === 'projects' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Project Execution WBS
        </button>

        <button
          onClick={() => setActiveReport('profit')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReport === 'profit' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Profitability & P&L
        </button>

        <button
          onClick={() => setActiveReport('expenses')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReport === 'expenses' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-slate-400'
          }`}
        >
          Site Expenses & Procurement
        </button>
      </div>

      {/* REPORT 1: SALES & PROPOSALS */}
      {activeReport === 'sales' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 space-y-4">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Sales Funnel & Quotation Performance Report
            </h3>
            <span className="text-xs font-mono text-amber-400">{quotations.length} Proposals Total</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Proposal #</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Proposal Status</th>
                <th className="p-4">Validity</th>
                <th className="p-4 font-bold text-amber-400">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-amber-400">{q.quoteNumber}</td>
                  <td className="p-4 font-bold text-slate-100">{q.clientName}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{q.validityDays || 30} Days</td>
                  <td className="p-4 font-bold text-slate-100 font-mono">{formatINR(q.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 2: PROJECT EXECUTION */}
      {activeReport === 'projects' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Project #</th>
                <th className="p-4">Project Title</th>
                <th className="p-4">Client</th>
                <th className="p-4">Phase Status</th>
                <th className="p-4">Progress %</th>
                <th className="p-4 font-bold text-amber-400">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-amber-400">{p.projectNumber}</td>
                  <td className="p-4 font-bold text-slate-100">{p.title}</td>
                  <td className="p-4 text-slate-300">{p.client?.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{p.progressPercentage}%</td>
                  <td className="p-4 font-bold text-slate-100 font-mono">{formatINR(p.budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 3: PROFITABILITY & P&L */}
      {activeReport === 'profit' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" /> Multi-Company Profit & Loss Statement
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-300 font-medium">Total Billed Client Revenue</span>
              <span className="font-bold font-mono text-slate-100">{formatINR(totalBilled)}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-300 font-medium">Less: Direct Site & Material Costs</span>
              <span className="font-bold font-mono text-rose-400">- {formatINR(totalDirectCosts)}</span>
            </div>
            <div className="flex justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="text-amber-300 font-bold">Gross Margin / Profit</span>
              <span className="font-bold font-mono text-amber-400">{formatINR(grossProfit)} ({netMarginPct}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: EXPENSES */}
      {activeReport === 'expenses' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4 font-bold text-amber-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">{e.title}</td>
                  <td className="p-4 text-slate-300">{e.project?.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold">{e.category}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-rose-400 font-mono">{formatINR(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
