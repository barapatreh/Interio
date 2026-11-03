'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  Send,
  Calendar as CalendarIcon,
  Receipt,
  Copy,
  Check,
  Bell
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  // Reminder Modal State
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderInvoice, setReminderInvoice] = useState<any>(null);
  const [reminderText, setReminderText] = useState('');
  const [copiedReminder, setCopiedReminder] = useState(false);

  const fetchDashboardData = async () => {
    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = '';
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id) compId = comp.id;
      } catch (e) {}
    }

    try {
      const res = await fetch(compId ? `/api/dashboard?companyId=${compId}` : '/api/dashboard');
      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('interio_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?.role) setUserRole(u.role);
      } catch (e) {}
    }
    fetchDashboardData();
  }, []);

  const handleOpenReminderModal = (inv: any) => {
    setReminderInvoice(inv);
    const clientName = inv.client?.name || inv.clientName || 'Valued Client';
    const amount = formatINR(inv.totalAmount || inv.amount);
    const text = `Dear ${clientName},\n\nThis is a polite payment reminder regarding Invoice #${inv.invoiceNumber} (${inv.milestoneName || 'Milestone Stage'}) for your fitout project.\n\nTotal Due Amount: ${amount}\n\nPlease transfer payment to our bank account:\nICICI Bank Ltd | A/C: 001105009988 | IFSC: ICIC0000011\n\nThank you!\nInterio Studio Operations`;
    setReminderText(text);
    setCopiedReminder(false);
    setShowReminderModal(true);
  };

  const handleSendWhatsAppDirect = (inv: any) => {
    const clientName = inv.client?.name || inv.clientName || 'Valued Client';
    const amount = formatINR(inv.totalAmount || inv.amount);
    const text = `Dear ${clientName},\n\nPayment Reminder for Invoice #${inv.invoiceNumber} (${inv.milestoneName}) of ${amount}.\n\nBank Transfer Details:\nICICI Bank Ltd | A/C: 001105009988 | IFSC: ICIC0000011\n\nThank you!\nInterio Studio`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendEventWhatsApp = (ev: any) => {
    const text = `📅 *WORK REMINDER - INTERIO STUDIO*\n📌 Task: ${ev.title}\n🏷️ Type: ${ev.eventType}\n🏗️ Site: ${ev.project?.title || 'Site'}\n⏰ Date: ${new Date(ev.eventDate).toLocaleDateString()} at ${ev.eventTime}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const leadsByStatus = Array.isArray(data?.leadsByStatus) ? data.leadsByStatus : [];
  const recentQuotations = Array.isArray(data?.recentQuotations) ? data.recentQuotations : [];
  const recentProjects = Array.isArray(data?.recentProjects) ? data.recentProjects : [];
  const pendingInvoices = Array.isArray(data?.pendingInvoices) ? data.pendingInvoices : [];
  const upcomingReminders = Array.isArray(data?.upcomingReminders) ? data.upcomingReminders : [];

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Chart data
  const revenueVsCostChart = [
    { name: 'Total Invoiced', amount: summary.totalInvoicedRevenue || 0, fill: '#3B82F6' },
    { name: 'Collected', amount: summary.totalCollectedRevenue || 0, fill: '#10B981' },
    { name: 'Vendor Payments', amount: summary.totalVendorPaid || 0, fill: '#F59E0B' },
    { name: 'Site Expenses', amount: summary.totalSiteExpenses || 0, fill: '#EC4899' },
    { name: 'Net Profit', amount: summary.netProfit || 0, fill: '#D4AF37' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Architecture & Turnkey Interior ERP
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Executive Command Center</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time monitoring across CRM leads, active site fitouts, client billing, vendor liabilities, and project margins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/calendar"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            <CalendarIcon className="w-4 h-4" /> Work Calendar & Reminders
          </Link>
          {userRole !== 'DESIGNER' && (
            <Link
              href="/quotations/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> New Quotation
            </Link>
          )}
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue Collected */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Payments Collected</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono text-slate-100">{formatINR(summary.totalCollectedRevenue)}</h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              Invoiced: <span className="text-slate-300 font-semibold">{formatINR(summary.totalInvoicedRevenue)}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Active Fitout Projects */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Fitout Projects</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-100">{summary.activeProjectsCount || 0}</h3>
            <p className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Sites currently executing
            </p>
          </div>
        </div>

        {/* Card 3: Total CRM Leads */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total CRM Leads</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-100">{summary.totalLeadsCount || 0}</h3>
            <p className="text-[11px] text-blue-400 mt-1 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Inquiries in pipeline
            </p>
          </div>
        </div>

        {/* Card 4: Net Margin */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Profit Margin</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold font-mono text-purple-300">{formatINR(summary.netProfit)}</h3>
            <p className="text-[11px] text-purple-400 mt-1 font-semibold">
              Margin: {summary.netMarginPercentage || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue & Cost Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Financial Overview & Net Cashflow</h2>
              <p className="text-xs text-slate-400">Invoiced Revenue vs Collections, Vendor Costs, and Net Profit</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              INR (₹)
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsCostChart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {revenueVsCostChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Site Calendar Reminders */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Upcoming Site Schedule
              </h2>
              <Link href="/calendar" className="text-xs text-amber-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {upcomingReminders.map((ev: any) => (
                <div key={ev.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ev.eventType}
                    </span>
                    <button
                      onClick={() => handleSendEventWhatsApp(ev)}
                      className="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> WhatsApp
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{ev.title}</h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{ev.eventTime}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{ev.project?.title || 'Site'}</span>
                  </p>
                </div>
              ))}

              {upcomingReminders.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No site visits or milestone deadlines scheduled.</p>
              )}
            </div>
          </div>

          <Link
            href="/calendar"
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl text-center block transition-colors mt-2"
          >
            + Add New Site Visit or Milestone Event
          </Link>
        </div>
      </div>

      {/* Operational Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fitout Projects */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" /> Active Fitout Projects
            </h2>
            <Link href="/projects" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              View Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.map((p: any) => (
              <div key={p.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{p.projectNumber}</span>
                    <h3 className="text-xs font-bold text-slate-100">{p.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{p.progressPercentage}% Done</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotations (Hidden for DESIGNER) */}
        {userRole !== 'DESIGNER' && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> Recent Quotations
              </h2>
              <Link href="/quotations" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                View All Proposals <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentQuotations.map((q: any) => (
                <div key={q.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">{q.quoteNumber}</span>
                    <h3 className="text-xs font-bold text-slate-100">{q.clientName}</h3>
                    <p className="text-[10px] text-slate-400">{q.siteAddress}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold font-mono text-slate-100 block">{formatINR(q.grandTotal)}</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* REMINDER MODAL */}
      {showReminderModal && reminderInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Payment Reminder & Bank Details
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy and send official payment reminder note to client for Invoice #{reminderInvoice.invoiceNumber}:
            </p>

            <textarea
              readOnly
              rows={8}
              value={reminderText}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleSendWhatsAppDirect(reminderInvoice)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Send className="w-3.5 h-3.5" /> Send Directly via WhatsApp
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(reminderText);
                  setCopiedReminder(true);
                  setTimeout(() => setCopiedReminder(false), 2000);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                {copiedReminder ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReminder ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
