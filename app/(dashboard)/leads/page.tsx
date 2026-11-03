'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  Clock,
  ArrowRight,
  MoreVertical,
  UserCheck,
  Edit3,
  Trash2,
  Calendar,
  Send,
  FileText,
  X,
  Sparkles,
  CalendarDays,
  DollarSign,
  Notebook
} from 'lucide-react';

export default function LeadsCRMPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [catalogueItems, setCatalogueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [siteVisitLead, setSiteVisitLead] = useState<any>(null);
  const [proposalLead, setProposalLead] = useState<any>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Add Lead Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Meta Ads',
    status: 'New',
    assignedTo: 'Vikram Mehta',
    propertyType: '3BHK Apartment',
    estimatedBudget: '',
    location: 'Mumbai',
    notes: ''
  });

  // Site Visit Form
  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    visitTime: '11:00 AM',
    notes: 'Initial site measurement & client requirements briefing.'
  });

  // Quick Proposal Form for Lead
  const [proposalItems, setProposalItems] = useState<any[]>([
    { room: 'Living Room', category: 'False Ceiling', title: 'Gypsum Ceiling', quantity: 450, unit: 'sq.ft', unitRate: 145 },
    { room: 'Kitchen', category: 'Modular Kitchen', title: 'Acrylic Finish Modular Kitchen', quantity: 120, unit: 'sq.ft', unitRate: 1850 }
  ]);
  const [discountAmount, setDiscountAmount] = useState(5000);
  const [taxRate, setTaxRate] = useState(18);

  const stages = ['New', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Won', 'Lost'];

  const fetchLeadsAndCatalogue = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const url = compId && compId !== 'ALL' ? `/api/leads?companyId=${compId}` : '/api/leads';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);

      const catRes = await fetch(compId && compId !== 'ALL' ? `/api/catalogue?companyId=${compId}` : '/api/catalogue');
      const catData = await catRes.json();
      if (Array.isArray(catData)) setCatalogueItems(catData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndCatalogue();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = '';
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id && comp?.id !== 'ALL') compId = comp.id;
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId: compId })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          source: 'Meta Ads',
          status: 'New',
          assignedTo: 'Vikram Mehta',
          propertyType: '3BHK Apartment',
          estimatedBudget: '',
          location: 'Mumbai',
          notes: ''
        });
        fetchLeadsAndCatalogue();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchLeadsAndCatalogue();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteVisitLead) return;

    try {
      // 1. Advance lead stage to 'Site Visit Scheduled'
      await handleUpdateStatus(siteVisitLead.id, 'Site Visit Scheduled');

      // 2. Register event in Work Calendar
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id && comp?.id !== 'ALL') compId = comp.id;
        } catch (e) {}
      }

      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: compId || siteVisitLead.companyId,
          title: `Site Visit - ${siteVisitLead.name} (${siteVisitLead.propertyType || 'Property'})`,
          eventType: 'Site Visit',
          eventDate: visitForm.visitDate || new Date().toISOString().split('T')[0],
          eventTime: visitForm.visitTime,
          priority: 'High',
          status: 'Scheduled',
          notes: `Client Phone: ${siteVisitLead.phone}. Location: ${siteVisitLead.location}. ${visitForm.notes}`
        })
      });

      alert(`Site Visit for ${siteVisitLead.name} scheduled on ${visitForm.visitDate}! Event added to Work Calendar.`);
      setSiteVisitLead(null);
      fetchLeadsAndCatalogue();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProposalForLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalLead) return;

    const subtotal = proposalItems.reduce((sum, item) => sum + item.quantity * item.unitRate, 0);
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (afterDiscount * taxRate) / 100;
    const grandTotal = afterDiscount + taxAmount;

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: proposalLead.companyId,
          leadId: proposalLead.id,
          clientName: proposalLead.name,
          clientPhone: proposalLead.phone,
          siteAddress: proposalLead.location,
          subtotal,
          discountAmount,
          taxRate,
          taxAmount,
          grandTotal,
          items: proposalItems
        })
      });

      if (res.ok) {
        alert(`Proposal generated successfully for ${proposalLead.name}! Lead status updated to "Proposal Sent".`);
        setProposalLead(null);
        fetchLeadsAndCatalogue();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEditedLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const res = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead)
      });
      if (res.ok) {
        setEditingLead(null);
        fetchLeadsAndCatalogue();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    setConvertingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.client?.id) {
        router.push(`/clients/${data.client.id}`);
      } else {
        alert(data.error || 'Failed to convert lead to client');
        setConvertingId(null);
      }
    } catch (error) {
      console.error(error);
      setConvertingId(null);
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
    <div className="space-y-6 pb-12 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">CRM Lead Pipeline</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {leads.length} Total Leads
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execute stage actions: Send Proposal directly to Lead, Schedule Site Visits, and Convert to Won Client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'kanban' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Lead Inquiry
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage);
            return (
              <div key={stage} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col min-w-[250px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-xs font-bold text-slate-200">{stage}</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
                  {stageLeads.map((lead) => (
                    <div key={lead.id} className="glass-card p-3.5 rounded-xl space-y-2 border border-slate-800/80 hover:border-amber-500/40 transition-all">
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-slate-100">{lead.name}</h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingLead(lead)}
                            title="Edit Lead Inquiry"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium">
                          {lead.source}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {lead.propertyType || 'Residential'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{lead.phone}</span>
                      </p>

                      {lead.estimatedBudget > 0 && (
                        <p className="text-xs font-bold text-amber-400">{formatINR(lead.estimatedBudget)}</p>
                      )}

                      {/* STAGE-SPECIFIC ACTIONS */}
                      <div className="pt-2 border-t border-slate-800/60 space-y-2">
                        {/* 1. NEW STAGE ACTIONS */}
                        {stage === 'New' && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(lead.id, 'Contacted')}
                              className="w-full py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-[10px] font-bold transition-colors"
                            >
                              📞 Contacted
                            </button>
                            <button
                              onClick={() => {
                                setSiteVisitLead(lead);
                                setVisitForm({ ...visitForm, visitDate: new Date().toISOString().split('T')[0] });
                              }}
                              className="w-full py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold transition-colors"
                            >
                              📅 Site Visit
                            </button>
                          </div>
                        )}

                        {/* 2. CONTACTED STAGE ACTIONS */}
                        {stage === 'Contacted' && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={() => {
                                setSiteVisitLead(lead);
                                setVisitForm({ ...visitForm, visitDate: new Date().toISOString().split('T')[0] });
                              }}
                              className="w-full py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold transition-colors"
                            >
                              📅 Site Visit
                            </button>
                            <button
                              onClick={() => setProposalLead(lead)}
                              className="w-full py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold transition-colors"
                            >
                              📄 Send Proposal
                            </button>
                          </div>
                        )}

                        {/* 3. SITE VISIT SCHEDULED STAGE ACTIONS */}
                        {stage === 'Site Visit Scheduled' && (
                          <div className="space-y-1">
                            <Link
                              href={`/requirements?leadId=${lead.id}`}
                              className="w-full py-1.5 bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/40 text-amber-200 border border-amber-500/40 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 block text-center"
                            >
                              <Notebook className="w-3 h-3 text-amber-400" /> Requirements & Proposal Brief
                            </Link>
                            <button
                              onClick={() => setProposalLead(lead)}
                              className="w-full py-1.5 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 hover:from-purple-500/40 text-purple-200 border border-purple-500/40 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-purple-400" /> Quick Proposal
                            </button>
                          </div>
                        )}

                        {/* 4. PROPOSAL SENT STAGE ACTIONS */}
                        {stage === 'Proposal Sent' && (
                          <div className="space-y-1">
                            <button
                              onClick={() => handleConvertToClient(lead.id)}
                              disabled={convertingId === lead.id}
                              className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" /> {convertingId === lead.id ? 'Converting...' : '🎉 Mark Won & Convert'}
                            </button>
                            <Link
                              href={`/quotations?search=${encodeURIComponent(lead.name)}`}
                              className="w-full py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold flex items-center justify-center gap-1 block text-center"
                            >
                              <FileText className="w-3 h-3 text-amber-400" /> View & Edit Proposal
                            </Link>
                            <button
                              onClick={() => handleUpdateStatus(lead.id, 'Lost')}
                              className="w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded text-[10px] font-semibold"
                            >
                              ❌ Mark Lost
                            </button>
                          </div>
                        )}

                        {/* 5. WON STAGE ACTIONS */}
                        {stage === 'Won' && (
                          <div className="space-y-1">
                            <Link
                              href="/clients"
                              className="w-full py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold flex items-center justify-center gap-1 block text-center"
                            >
                              <UserCheck className="w-3 h-3" /> Active Client
                            </Link>
                          </div>
                        )}

                        {/* 6. LOST STAGE ACTIONS */}
                        {stage === 'Lost' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'Contacted')}
                            className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold"
                          >
                            🔄 Re-open Inquiry
                          </button>
                        )}

                        {/* Manual Stage Change Dropdown */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-slate-500">Stage:</span>
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] text-amber-300 font-bold focus:outline-none"
                          >
                            {stages.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="p-4 text-center text-slate-600 text-xs italic">No leads in stage</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Lead Name</th>
                <th className="p-4">Phone / Email</th>
                <th className="p-4">Source</th>
                <th className="p-4">Property & Location</th>
                <th className="p-4">Budget</th>
                <th className="p-4">Stage / Status</th>
                <th className="p-4">Assigned To</th>
                <th className="p-4 text-right">Stage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">{lead.name}</td>
                  <td className="p-4 text-slate-300">
                    <p>{lead.phone}</p>
                    <p className="text-[10px] text-slate-400">{lead.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded text-[10px]">
                      {lead.source}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <p className="font-semibold">{lead.propertyType}</p>
                    <p className="text-[10px] text-slate-400">{lead.location}</p>
                  </td>
                  <td className="p-4 font-bold text-amber-400">{formatINR(lead.estimatedBudget)}</td>
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                      className="bg-slate-900 border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
                    >
                      {stages.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-slate-400">{lead.assignedTo || 'Unassigned'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {lead.status === 'Proposal Sent' && (
                        <Link
                          href={`/quotations?search=${encodeURIComponent(lead.name)}`}
                          className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg font-bold text-[10px] border border-amber-500/40 transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-amber-400" /> View / Edit Proposal
                        </Link>
                      )}

                      {lead.status !== 'Proposal Sent' && lead.status !== 'Won' && (
                        <button
                          onClick={() => setProposalLead(lead)}
                          className="px-2.5 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg font-bold text-[10px] border border-purple-500/40 transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-purple-400" /> Send Proposal
                        </button>
                      )}

                      {lead.status !== 'Won' ? (
                        <button
                          onClick={() => handleConvertToClient(lead.id)}
                          disabled={convertingId === lead.id}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg font-bold text-[10px] border border-emerald-500/40 transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" /> {convertingId === lead.id ? 'Converting...' : 'Convert Client'}
                        </button>
                      ) : (
                        <Link
                          href="/clients"
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-bold text-[10px] border border-emerald-500/30"
                        >
                          Active Client
                        </Link>
                      )}

                      <button
                        onClick={() => setEditingLead(lead)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[10px] border border-slate-700"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SCHEDULE SITE VISIT MODAL */}
      {siteVisitLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-400" /> Schedule Site Measurement Visit
              </h3>
              <button onClick={() => setSiteVisitLead(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-amber-300">{siteVisitLead.name}</p>
              <p className="text-slate-400">Phone: {siteVisitLead.phone} | Property: {siteVisitLead.propertyType || 'Property'}</p>
              <p className="text-slate-400">Location: {siteVisitLead.location}</p>
            </div>

            <form onSubmit={handleSaveSiteVisit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Visit Time *</label>
                  <input
                    type="text"
                    required
                    value={visitForm.visitTime}
                    onChange={(e) => setVisitForm({ ...visitForm, visitTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Site PM / Architect Notes</label>
                <textarea
                  rows={2}
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  placeholder="Carry measurement tape, laser distance meter..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSiteVisitLead(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <CalendarDays className="w-4 h-4" /> Save & Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PROPOSAL CREATOR MODAL FOR LEAD */}
      {proposalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Create & Send Proposal for Lead
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generates an official quote for <strong className="text-slate-200">{proposalLead.name}</strong> and advances stage to "Proposal Sent".
                </p>
              </div>
              <button onClick={() => setProposalLead(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProposalForLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Client / Lead Name</span>
                  <p className="font-bold text-slate-100">{proposalLead.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Phone / Site Location</span>
                  <p className="font-bold text-slate-100">{proposalLead.phone} | {proposalLead.location}</p>
                </div>
              </div>

              {/* Proposal Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider">Line Items Scope</h4>
                  <button
                    type="button"
                    onClick={() =>
                      setProposalItems([
                        ...proposalItems,
                        { room: 'Master Bedroom', category: 'Wardrobes', title: 'Sliding Wardrobe', quantity: 180, unit: 'sq.ft', unitRate: 1650 }
                      ])
                    }
                    className="text-amber-400 text-[10px] font-bold hover:underline"
                  >
                    + Add Custom Item
                  </button>
                </div>

                <div className="space-y-2">
                  {proposalItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 items-center">
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...proposalItems];
                            updated[idx].title = e.target.value;
                            setProposalItems(updated);
                          }}
                          placeholder="Item Title"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={item.room}
                          onChange={(e) => {
                            const updated = [...proposalItems];
                            updated[idx].room = e.target.value;
                            setProposalItems(updated);
                          }}
                          placeholder="Room"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...proposalItems];
                            updated[idx].quantity = parseFloat(e.target.value || '0');
                            setProposalItems(updated);
                          }}
                          placeholder="Qty"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.unitRate}
                          onChange={(e) => {
                            const updated = [...proposalItems];
                            updated[idx].unitRate = parseFloat(e.target.value || '0');
                            setProposalItems(updated);
                          }}
                          placeholder="Rate ₹"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-400 font-bold"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => setProposalItems(proposalItems.filter((_, i) => i !== idx))}
                          className="text-rose-400 font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations */}
              <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-bold text-slate-200">
                    {formatINR(proposalItems.reduce((s, i) => s + i.quantity * i.unitRate, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Discount (₹):</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value || '0'))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-bold text-amber-400"
                  />
                </div>
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-800 text-amber-300">
                  <span>Grand Total (incl. 18% GST):</span>
                  <span>
                    {formatINR(
                      (Math.max(0, proposalItems.reduce((s, i) => s + i.quantity * i.unitRate, 0) - discountAmount) * 1.18)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProposalLead(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-slate-100 font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Save Proposal & Advance Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Add New CRM Lead Inquiry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Client / Lead Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Shah"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Lead Stage / Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  >
                    {stages.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Lead Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Meta Ads">Meta Ads (Instagram/FB)</option>
                    <option value="Google Ads">Google Search Ads</option>
                    <option value="Property Portal">Property Portal (Housing/99acres)</option>
                    <option value="Website">Website Form</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Broker">Broker Network</option>
                    <option value="Manual">Manual Walk-in</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Property Type</label>
                  <input
                    type="text"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    placeholder="3BHK Villa / Penthouse"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Property Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai, Andheri West"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                  placeholder="2500000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Assigned Sales Executive</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Requirement Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Specific requirements, design preferences..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Create Lead Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Edit Lead Inquiry #{editingLead.name}</h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Client / Lead Name *</label>
                <input
                  type="text"
                  required
                  value={editingLead.name || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editingLead.phone || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={editingLead.email || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Lead Stage / Status</label>
                  <select
                    value={editingLead.status || 'New'}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-300 font-bold"
                  >
                    {stages.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Lead Source</label>
                  <select
                    value={editingLead.source || 'Meta Ads'}
                    onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Meta Ads">Meta Ads (Instagram/FB)</option>
                    <option value="Google Ads">Google Search Ads</option>
                    <option value="Property Portal">Property Portal (Housing/99acres)</option>
                    <option value="Website">Website Form</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Broker">Broker Network</option>
                    <option value="Manual">Manual Walk-in</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Property Type</label>
                  <input
                    type="text"
                    value={editingLead.propertyType || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, propertyType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Property Location</label>
                  <input
                    type="text"
                    value={editingLead.location || 'Mumbai'}
                    onChange={(e) => setEditingLead({ ...editingLead, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={editingLead.estimatedBudget || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, estimatedBudget: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Assigned Sales Executive</label>
                <input
                  type="text"
                  value={editingLead.assignedTo || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, assignedTo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Requirement Notes</label>
                <textarea
                  rows={2}
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Save Lead Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
