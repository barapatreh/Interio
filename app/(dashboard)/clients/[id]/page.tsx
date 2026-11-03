'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  ArrowLeft,
  Briefcase,
  FileText,
  Receipt,
  CreditCard,
  Palette,
  PlusCircle,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  DollarSign,
  Printer,
  Plus,
  Edit,
  ExternalLink,
  Download,
  Eye,
  MessageSquare,
  FileCode,
  Link as LinkIcon
} from 'lucide-react';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = params?.id;
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [extraWorks, setExtraWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [activeTab, setActiveTab] = useState<'quotations' | 'projects' | 'invoices' | 'payments' | 'designs' | 'extraWork' | 'costing'>('quotations');

  const [selectedDesignFile, setSelectedDesignFile] = useState<any>(null);
  const [showViewerModal, setShowViewerModal] = useState(false);

  const loadClientDetails = () => {
    if (!clientId) return;

    Promise.all([
      fetch(`/api/clients/${clientId}`).then((res) => res.json()),
      fetch(`/api/quotations`).then((res) => res.json()),
      fetch(`/api/projects`).then((res) => res.json()),
      fetch(`/api/invoices`).then((res) => res.json()),
      fetch(`/api/designs`).then((res) => res.json()),
      fetch(`/api/extra-work`).then((res) => res.json())
    ])
      .then(([cData, qData, pData, iData, dData, eData]) => {
        setClient(cData);
        if (Array.isArray(qData)) {
          setQuotations(qData.filter((q: any) => q.clientId === clientId || q.clientName?.trim().toLowerCase() === cData.name?.trim().toLowerCase()));
        }
        if (Array.isArray(pData)) setProjects(pData.filter((p: any) => p.clientId === clientId));
        if (Array.isArray(iData)) {
          const clientInvs = iData.filter((i: any) => i.clientId === clientId || i.project?.clientId === clientId);
          setInvoices(clientInvs);
          const allPayments: any[] = [];
          clientInvs.forEach((inv: any) => {
            if (inv.payments) allPayments.push(...inv.payments);
          });
          setPayments(allPayments);
        }
        if (Array.isArray(dData)) setDesigns(dData.filter((d: any) => d.project?.clientId === clientId));
        if (Array.isArray(eData)) setExtraWorks(eData.filter((e: any) => e.project?.clientId === clientId));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClientDetails();
  }, [clientId]);

  const handleConvertSpecificQuotation = async (quote: any) => {
    if (!quote) return;
    if (!confirm(`Convert proposal ${quote.quoteNumber} (₹${(quote.grandTotal || 0).toLocaleString('en-IN')}) into the active Fitout Project?`)) return;

    setConverting(true);
    try {
      const res = await fetch(`/api/quotations/${quote.id}/convert`, {
        method: 'POST'
      });

      const data = await res.json();
      setConverting(false);
      if (res.ok && data.success) {
        alert(data.message || `Quotation ${quote.quoteNumber} converted to active fitout project!`);
        loadClientDetails();
        setActiveTab('projects');
      } else {
        alert(data.error || 'Failed to convert proposal to project.');
      }
    } catch (error) {
      console.error(error);
      setConverting(false);
      alert('Error converting proposal to fitout project.');
    }
  };

  const handleConvertToProject = async () => {
    if (!client) return;

    if (quotations.length > 0) {
      // Prompt to select from existing proposals if available
      const latestQuote = quotations[0];
      handleConvertSpecificQuotation(latestQuote);
      return;
    }

    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = client.companyId;
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id) compId = comp.id;
      } catch (e) {}
    }

    if (!confirm(`Convert ${client.name} into an active Fitout Project?`)) return;

    setConverting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: compId,
          title: `${client.name} Residence - Turnkey Fitout`,
          siteAddress: client.address || client.city || 'Site Address TBD',
          budget: client.budget
        })
      });

      const data = await res.json();
      setConverting(false);
      if (res.ok && data.success) {
        alert(data.message || 'Client converted to Fitout Project successfully!');
        loadClientDetails();
        setActiveTab('projects');
      } else {
        alert(data.error || 'Failed to convert client to project.');
      }
    } catch (error) {
      console.error(error);
      setConverting(false);
      alert('Error converting client to fitout project.');
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client || client.error) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p className="text-base font-bold text-slate-200">Client profile not found.</p>
        <Link href="/clients" className="inline-block text-amber-400 font-semibold underline text-xs">
          Back to Clients Directory
        </Link>
      </div>
    );
  }

  const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount || i.amount || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (p.amountPaid || 0), 0);
  const pendingBalance = totalInvoiced - totalCollected;

  return (
    <div className="space-y-6 pb-16">
      {/* Back link & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients Directory
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/quotations/new?clientId=${clientId}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create Proposal Option
          </Link>

          <button
            onClick={handleConvertToProject}
            disabled={converting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Briefcase className="w-4 h-4" /> {converting ? 'Converting...' : 'Convert to Fitout Project'}
          </button>
        </div>
      </div>

      {/* Main Client Profile Header Banner */}
      <div className="glass-card rounded-3xl p-6 border border-amber-500/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {client.propertyType || '3BHK Apartment'}
              </span>
              <h1 className="text-2xl font-bold text-slate-100">{client.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {client.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{client.address || client.city || 'Site Address TBD'}</span>
              <span>•</span>
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{client.phone}</span>
              <span>•</span>
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{client.email || 'N/A'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Billed</span>
              <span className="text-lg font-bold text-slate-100 font-mono">{formatINR(totalInvoiced)}</span>
            </div>
            <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/30 text-right">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Collected Payments</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{formatINR(totalCollected)}</span>
            </div>
            <div className="bg-amber-950/20 p-3 rounded-2xl border border-amber-500/30 text-right">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Outstanding Balance</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{formatINR(pendingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 360° MAPPING NAVIGATION TABS */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'quotations' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Proposals & Quotes ({quotations.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'projects' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Fitout Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'invoices' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Invoices & GST ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'payments' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Payment Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('designs')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'designs' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          3D Renders & CAD ({designs.length})
        </button>
        <button
          onClick={() => setActiveTab('extraWork')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'extraWork' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Extra Work Orders ({extraWorks.length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      {/* MULTIPLE PROPOSALS TABLE FOR CLIENT */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Multiple Proposal Options ({quotations.length})</h3>
              <p className="text-[11px] text-slate-400">Generate multiple proposals (e.g. Premium vs Luxury options) and select which proposal gets converted to the active project.</p>
            </div>
            <Link
              href={`/quotations/new?clientId=${clientId}`}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Proposal Option
            </Link>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Proposal #</th>
                  <th className="p-4">Site Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 font-bold text-amber-400">Grand Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {quotations.map((q, idx) => {
                  const isConverted = q.status === 'Converted' || q.status === 'Converted to Project';

                  return (
                    <tr key={q.id} className="hover:bg-slate-900/40">
                      <td className="p-4">
                        <span className="font-mono font-bold text-amber-400 block">{q.quoteNumber}</span>
                        <span className="text-[10px] text-slate-400">Option {idx + 1}</span>
                      </td>
                      <td className="p-4 text-slate-300">{q.siteAddress}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isConverted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-100 font-mono text-sm">{formatINR(q.grandTotal)}</td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/quotations/new?id=${q.id}`}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs inline-flex items-center gap-1 transition-all"
                          title="Edit Proposal"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                        </Link>
                        {isConverted ? (
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Selected Contract
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConvertSpecificQuotation(q)}
                            disabled={converting}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <Briefcase className="w-3.5 h-3.5" /> Select & Convert to Project
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {quotations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                      No proposal options generated for this client yet. Click "Add New Proposal Option" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">No fitout projects created yet for {client.name}.</p>
              <button
                onClick={handleConvertToProject}
                disabled={converting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" /> Convert Client to Fitout Project Now
              </button>
            </div>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-amber-400 font-bold text-xs">{p.projectNumber}</span>
                    <h3 className="text-base font-bold text-slate-100">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Approved Budget: <span className="font-mono font-bold text-amber-400">{formatINR(p.budget)}</span></p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{p.progressPercentage}% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                </div>
                <Link
                  href={`/projects/${p.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-bold"
                >
                  Open Fitout Project Command View ➔
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Milestone</th>
                <th className="p-4">Status</th>
                <th className="p-4 font-bold text-amber-400">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-amber-400">{inv.invoiceNumber}</td>
                  <td className="p-4 text-slate-300">{inv.milestoneName}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-100">{formatINR(inv.totalAmount || inv.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Txn Ref</th>
                <th className="p-4 font-bold text-emerald-400">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-200">{p.paymentMode}</td>
                  <td className="p-4 font-mono text-slate-400">{p.transactionRef || 'N/A'}</td>
                  <td className="p-4 font-bold text-emerald-400 font-mono">{formatINR(p.amountPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ENHANCED 3D RENDERS & CAD BLUEPRINTS TAB */}
      {activeTab === 'designs' && (
        <div className="space-y-4">
          {designs.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
              <Palette className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No 3D renders or CAD blueprints uploaded for this client yet.</p>
              <Link
                href="/designs"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                Go to Design Studio & Upload Files
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {designs.map((d) => (
                <div key={d.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold uppercase">
                          {d.type}
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm mt-1">{d.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">Version Tag: {d.version}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.approvalStatus === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : d.approvalStatus === 'Disapproved'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {d.approvalStatus === 'Approved' ? '✓ Approved' : d.approvalStatus === 'Disapproved' ? '✕ Changes Requested' : '⏳ Pending Signoff'}
                      </span>
                    </div>

                    {d.clientFeedback && (
                      <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Feedback: {d.clientFeedback}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedDesignFile(d);
                        setShowViewerModal(true);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" /> View Blueprint / Render
                    </button>
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'extraWork' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Work Title</th>
                <th className="p-4">Requested By</th>
                <th className="p-4">Approved Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {extraWorks.map((ew) => (
                <tr key={ew.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">{ew.workTitle}</td>
                  <td className="p-4 text-slate-400">{ew.requestedBy}</td>
                  <td className="p-4 font-bold text-amber-400 font-mono">{formatINR(ew.approvedAmount)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {ew.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {showViewerModal && selectedDesignFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-5xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" /> {selectedDesignFile.title}
                </h3>
                <p className="text-xs text-slate-400">Type: {selectedDesignFile.type} • Version: {selectedDesignFile.version}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDesignFile.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download File
                </a>
                <button onClick={() => setShowViewerModal(false)} className="text-slate-400 hover:text-slate-200 p-2 font-bold">
                  ✕
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[60vh] flex items-center justify-center overflow-hidden">
              {selectedDesignFile.fileUrl.includes('.pdf') || selectedDesignFile.fileUrl.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedDesignFile.fileUrl}
                  className="w-full h-[70vh] rounded-xl border border-slate-800"
                  title="PDF Blueprint Viewer"
                />
              ) : (
                <img
                  src={selectedDesignFile.fileUrl}
                  alt={selectedDesignFile.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
