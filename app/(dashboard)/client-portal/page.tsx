'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Briefcase,
  Palette,
  Receipt,
  CheckCircle,
  Clock,
  Printer,
  Eye,
  MessageSquare,
  Sparkles,
  CreditCard,
  Building,
  TrendingUp,
  Download,
  AlertCircle,
  ExternalLink,
  FileCode,
  Link as LinkIcon,
  ImageIcon,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  LifeBuoy,
  Plus,
  Send,
  HelpCircle,
  CheckSquare
} from 'lucide-react';

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<'quotations' | 'projects' | 'designs' | 'invoices' | 'extrawork' | 'tickets'>('quotations');
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [extraWorks, setExtraWorks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);

  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedDesignFile, setSelectedDesignFile] = useState<any>(null);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const [feedbackInput, setFeedbackInput] = useState<{ [key: string]: string }>({});

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    projectId: '',
    category: 'Fitout Snag',
    priority: 'Medium',
    subject: '',
    description: ''
  });

  const fetchClientPortal = async () => {
    try {
      const userStr = localStorage.getItem('interio_user');
      let loggedUser: any = null;
      if (userStr) {
        try {
          loggedUser = JSON.parse(userStr);
        } catch (e) {}
      }

      const activeCompStr = localStorage.getItem('interio_active_company');
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp) setCompany(comp);
        } catch (e) {}
      }

      const clientsRes = await fetch('/api/clients');
      const clients = await clientsRes.json();

      let matchedClient: any = null;
      if (Array.isArray(clients) && clients.length > 0) {
        if (loggedUser?.clientId) {
          matchedClient = clients.find((c: any) => c.id === loggedUser.clientId);
        }
        if (!matchedClient && loggedUser?.email) {
          matchedClient = clients.find((c: any) => c.email?.toLowerCase() === loggedUser.email.toLowerCase());
        }
        if (!matchedClient && loggedUser?.name) {
          const cleanUserName = loggedUser.name.replace(/\(Client\)/i, '').trim().toLowerCase();
          matchedClient = clients.find((c: any) => c.name.trim().toLowerCase().includes(cleanUserName));
        }
        if (!matchedClient) {
          matchedClient = clients[0];
        }
      }

      if (matchedClient) {
        setClientData(matchedClient);

        // Fetch Quotations
        const qRes = await fetch('/api/quotations');
        const qData = await qRes.json();
        if (Array.isArray(qData)) {
          setQuotations(qData.filter((q: any) => q.clientId === matchedClient.id || q.clientName.trim().toLowerCase() === matchedClient.name.trim().toLowerCase()));
        }

        // Fetch Projects
        const pRes = await fetch('/api/projects');
        const pData = await pRes.json();
        if (Array.isArray(pData)) {
          const clientProjects = pData.filter((p: any) => p.clientId === matchedClient.id || p.client?.name.trim().toLowerCase() === matchedClient.name.trim().toLowerCase());
          setProjects(clientProjects);
          if (clientProjects.length > 0) {
            setTicketForm((prev) => ({ ...prev, projectId: clientProjects[0].id }));
          }

          // Fetch Extra Works
          const ewRes = await fetch('/api/extra-work');
          const ewData = await ewRes.json();
          if (Array.isArray(ewData)) {
            const projectIds = clientProjects.map((p) => p.id);
            setExtraWorks(ewData.filter((ew: any) => projectIds.includes(ew.projectId)));
          }
        }

        // Fetch Designs
        const dRes = await fetch('/api/designs');
        const dData = await dRes.json();
        if (Array.isArray(dData)) {
          setDesigns(dData.filter((d: any) => !d.project?.clientId || d.project?.clientId === matchedClient.id));
        }

        // Fetch Invoices
        const iRes = await fetch('/api/invoices');
        const iData = await iRes.json();
        if (Array.isArray(iData)) {
          setInvoices(iData.filter((i: any) => i.project?.clientId === matchedClient.id || i.clientName === matchedClient.name));
        }

        // Fetch Support Tickets
        const tRes = await fetch(`/api/tickets?clientId=${matchedClient.id}`);
        const tData = await tRes.json();
        if (Array.isArray(tData)) setTickets(tData);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPortal();
  }, []);

  const handleUpdateDesignStatus = async (designId: string, status: 'Approved' | 'Disapproved') => {
    const feedback = feedbackInput[designId] || '';
    try {
      const res = await fetch('/api/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: designId, status, clientFeedback: feedback })
      });
      if (res.ok) {
        alert(`Design asset marked as ${status}! Status updated in Admin panel.`);
        fetchClientPortal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData || !ticketForm.subject || !ticketForm.description) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: clientData.companyId,
          clientId: clientData.id,
          projectId: ticketForm.projectId || null,
          category: ticketForm.category,
          priority: ticketForm.priority,
          subject: ticketForm.subject,
          description: ticketForm.description
        })
      });

      if (res.ok) {
        setShowTicketModal(false);
        setTicketForm({
          projectId: projects[0]?.id || '',
          category: 'Fitout Snag',
          priority: 'Medium',
          subject: '',
          description: ''
        });
        alert('Support Ticket successfully submitted! Admin has been notified.');
        fetchClientPortal();
      }
    } catch (error) {
      console.error(error);
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Client Self-Service Portal
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100">Welcome, {clientData?.name || 'Valued Client'}</h1>
            <p className="text-xs text-slate-400 mt-1">
              {clientData?.propertyType || 'Residential Fitout'} • Site: {clientData?.address || 'Navi Mumbai'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <LifeBuoy className="w-4 h-4" /> Raise Support Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'quotations'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Cost Quotations ({quotations.length})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Site Execution ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('designs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'designs'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" /> 3D Renders & CAD ({designs.length})
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" /> Tax Invoices ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('extrawork')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'extrawork'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" /> Scope Variations ({extraWorks.length})
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4" /> Support Tickets ({tickets.length})
        </button>
      </div>

      {/* TAB 1: QUOTATIONS */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Proposal #</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 font-bold text-amber-400">Grand Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono font-bold text-amber-400">{q.quoteNumber}</td>
                    <td className="p-4 text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-100">{formatINR(q.grandTotal)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedQuote(q);
                          setShowQuoteModal(true);
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> View & Print Proposal PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & WBS MILESTONES */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.map((proj) => (
            <div key={proj.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{proj.title}</h3>
                  <p className="text-xs text-slate-400">Ref: {proj.projectNumber} • Site: {proj.siteAddress}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-400">{proj.progressPercentage || 0}% Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proj.progressPercentage || 0}%` }}
                />
              </div>

              {/* Milestone Phases */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Site Execution Milestones</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {proj.milestones?.map((m: any) => (
                    <div key={m.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{m.order}. {m.title}</p>
                        <p className="text-[10px] text-slate-400">{m.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: 3D RENDERS & CAD BLUEPRINTS */}
      {activeTab === 'designs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {designs.map((d) => (
              <div key={d.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold uppercase">
                      {d.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{d.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    d.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {d.approvalStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDesignFile(d);
                      setShowViewerModal(true);
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-amber-400" /> View Blueprint / Render PDF
                  </button>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                {/* Sign-off Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter approval notes or snag feedback..."
                    value={feedbackInput[d.id] || ''}
                    onChange={(e) => setFeedbackInput({ ...feedbackInput, [d.id]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateDesignStatus(d.id, 'Approved')}
                      className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Approve Design
                    </button>
                    <button
                      onClick={() => handleUpdateDesignStatus(d.id, 'Disapproved')}
                      className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> Request Changes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TAX INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Milestone Stage</th>
                  <th className="p-4">Issued Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 font-bold text-amber-400">Total Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono font-bold text-amber-400">{inv.invoiceNumber}</td>
                    <td className="p-4 text-slate-300">{inv.milestoneName || 'Fitout Milestone Invoice'}</td>
                    <td className="p-4 text-slate-400">{new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 space-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                      {inv.reminderStatus === 'Reminder Sent' && (
                        <div className="text-[10px] text-sky-400 font-semibold flex items-center gap-1 mt-0.5">
                          📲 Payment Reminder Issued
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-100">{formatINR(inv.totalAmount || inv.amount)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setShowInvoiceModal(true);
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> View & Print Tax Invoice PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SCOPE VARIATIONS */}
      {activeTab === 'extrawork' && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Variation Title & Details</th>
                  <th className="p-4 font-bold text-emerald-400">Approved Cost</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {extraWorks.map((ew) => (
                  <tr key={ew.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono text-slate-400">{new Date(ew.createdDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-100">{ew.workTitle}</p>
                      <p className="text-[10px] text-slate-400">{ew.description}</p>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{formatINR(ew.approvedAmount || ew.estimatedCost)}</td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {ew.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT & SITE ISSUE TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-amber-400" /> Support & Site Issue Tickets
            </h3>
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Raise Support Ticket
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Ticket #</th>
                  <th className="p-4">Category & Subject</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Admin Resolution Notes</th>
                  <th className="p-4 text-right">Date Raised</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono font-bold text-amber-400">{t.ticketNumber}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold">
                        {t.category}
                      </span>
                      <p className="font-bold text-slate-100 mt-1">{t.subject}</p>
                      <p className="text-[10px] text-slate-400">{t.description}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : t.status === 'Under Review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-[11px] text-slate-300 font-medium italic">{t.adminNotes || 'Awaiting admin review...'}</p>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400">
                      {new Date(t.createdDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                      No support tickets raised yet. Click "Raise Support Ticket" above if you have any query or site snag.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RAISE TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" /> Raise Support & Site Ticket
              </h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Project Site *</label>
                <select
                  value={ticketForm.projectId}
                  onChange={(e) => setTicketForm({ ...ticketForm, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category *</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Fitout Snag">Fitout Snag / Defect</option>
                    <option value="Design Modification">Design Modification</option>
                    <option value="Billing Clarification">Billing Clarification</option>
                    <option value="Site Progress Query">Site Progress Query</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Priority *</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Wardrobe Handle Alignment Snag"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Issue Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide detailed description of the site issue or query..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D & CAD BLUEPRINT PDF / IMAGE VIEWER MODAL */}
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
                  <Download className="w-4 h-4" /> Download Original File
                </a>
                <button onClick={() => setShowViewerModal(false)} className="text-slate-400 hover:text-slate-200 p-2 font-bold">
                  ✕
                </button>
              </div>
            </div>

            {/* VIEWER CANVAS */}
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

      {/* PROPOSAL PDF PRINT MODAL */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Proposal Document Viewer</h3>
                <p className="text-xs text-slate-400">Proposal #{selectedQuote.quoteNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Proposal PDF
                </button>
                <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-200 p-2 font-bold">
                  ✕
                </button>
              </div>
            </div>

            {/* PRINTABLE PROPOSAL VIEW */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-slate-200 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-amber-400">{company?.name || 'Era Interio'}</h2>
                  <p className="text-xs text-slate-400 mt-1">{company?.address || 'Mumbai, Maharashtra'}</p>
                  <p className="text-xs text-slate-400">GSTIN: {company?.gstin || '27AAAAA1234A1Z5'}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-slate-100 font-mono">{selectedQuote.quoteNumber}</h3>
                  <p className="text-xs text-slate-400">Date: {new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Status: <span className="text-amber-300 font-bold">{selectedQuote.status}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-slate-400">CLIENT DETAILS:</p>
                  <p className="font-bold text-slate-100 text-sm mt-1">{selectedQuote.clientName}</p>
                  <p className="text-slate-300">{selectedQuote.clientPhone}</p>
                </div>
                <div>
                  <p className="text-slate-400">FITOUT SITE LOCATION:</p>
                  <p className="font-bold text-slate-100 mt-1">{selectedQuote.siteAddress || 'Site Address TBD'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Item / Room Description</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Rate</th>
                      <th className="p-3 text-right font-bold text-amber-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedQuote.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <p className="font-bold text-slate-200">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.description}</p>
                        </td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">{item.unit}</td>
                        <td className="p-3">{formatINR(item.unitRate)}</td>
                        <td className="p-3 text-right font-bold text-slate-100">{formatINR(item.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">{formatINR(selectedQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST Tax ({selectedQuote.taxRate || 18}%):</span>
                    <span className="font-mono text-slate-200">{formatINR(selectedQuote.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-amber-400 pt-2 border-t border-slate-800">
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatINR(selectedQuote.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
