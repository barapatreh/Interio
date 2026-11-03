'use client';

import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  FileText,
  Receipt,
  FileCheck,
  Printer
} from 'lucide-react';

export default function ExtraWorkPage() {
  const [extraWorks, setExtraWorks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    workTitle: '',
    description: '',
    requestedBy: 'Client',
    estimatedCost: '',
    approvedAmount: ''
  });

  const fetchData = async () => {
    try {
      const [ewRes, pRes, invRes] = await Promise.all([
        fetch('/api/extra-work').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/invoices').then((r) => r.json())
      ]);
      setExtraWorks(ewRes);
      setProjects(pRes);
      setInvoices(invRes);
      if (pRes.length > 0) setFormData((prev) => ({ ...prev, projectId: pRes[0].id }));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExtraWork = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/extra-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          approvalStatus: 'Approved',
          approvedAmount: formData.approvedAmount || formData.estimatedCost,
          billingAdded: true
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateApproval = async (id: string, status: string, amount: number) => {
    try {
      const res = await fetch('/api/extra-work', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approvalStatus: status, approvedAmount: amount, billingAdded: status === 'Approved' })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 1-Click Generate Extra Work Invoice
  const handleGenerateInvoice = async (ew: any) => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const amount = parseFloat(ew.approvedAmount || ew.estimatedCost) || 0;
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: compId,
          projectId: ew.projectId,
          clientId: ew.project?.clientId,
          clientName: ew.project?.client?.name,
          milestoneName: `Extra Work: ${ew.workTitle}`,
          amount,
          taxAmount: amount * 0.18,
          totalAmount: amount * 1.18,
          status: 'Issued',
          notes: `Extra work variation order scope for ${ew.workTitle}`
        })
      });

      if (res.ok) {
        alert(`Extra Work Tax Invoice generated successfully!`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = extraWorks.filter(
    (ew) =>
      ew.workTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ew.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ew.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
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
            <PlusCircle className="w-4 h-4" /> Scope Variation Orders • Module 11
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Extra Work & Scope Variations</h1>
          <p className="text-xs text-slate-400">
            Record additional scope changes during site execution, generate stage invoices, and record client payment receipts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Variation Order
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work title, project, or requested by..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Extra Work Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Variation Title & Description</th>
              <th className="p-4">Project Site</th>
              <th className="p-4 font-bold text-emerald-400">Approved Billing</th>
              <th className="p-4">Invoice & Payment Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((ew) => {
              const matchedInv = invoices.find(
                (inv) => inv.projectId === ew.projectId && (inv.milestoneName?.includes(ew.workTitle) || inv.notes?.includes(ew.workTitle))
              );

              return (
                <tr key={ew.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono text-slate-400">{new Date(ew.createdDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-100">{ew.workTitle}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{ew.description}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{ew.project?.title}</div>
                    <div className="text-[10px] text-slate-400">{ew.project?.client?.name}</div>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{formatINR(ew.approvedAmount || ew.estimatedCost)}</td>
                  <td className="p-4">
                    {matchedInv ? (
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {matchedInv.invoiceNumber}
                        </span>
                        <div className="text-[10px]">
                          {matchedInv.status === 'Paid' ? (
                            <span className="text-emerald-400 font-bold">✓ Payment Receipt Issued</span>
                          ) : (
                            <span className="text-rose-400 font-bold">⏳ Invoice Issued (Unpaid)</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[10px]">No Invoice Issued Yet</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {ew.approvalStatus === 'Approved' ? (
                      <div>
                        {!matchedInv ? (
                          <button
                            onClick={() => handleGenerateInvoice(ew)}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Generate Invoice
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Invoiced
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateApproval(ew.id, 'Approved', ew.estimatedCost)}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-lg font-bold text-[10px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateApproval(ew.id, 'Rejected', 0)}
                          className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-lg font-bold text-[10px]"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Variation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-amber-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" /> Add Extra Work Order
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExtraWork} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Project Site *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Variation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balcony WPC Composite Decking"
                  value={formData.workTitle}
                  onChange={(e) => setFormData({ ...formData, workTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Requested By</label>
                  <select
                    value={formData.requestedBy}
                    onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Client">Client</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="Architect">Architect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Estimated Addon Cost (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="85000"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Scope Modification Details</label>
                <textarea
                  rows={3}
                  placeholder="Client requested exterior WPC deck flooring in main balcony with accent planters..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
                >
                  Approve & Add to Billing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
