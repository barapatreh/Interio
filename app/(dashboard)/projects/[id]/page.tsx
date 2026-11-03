'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Building,
  Image as ImageIcon,
  Truck,
  Receipt,
  DollarSign,
  PlusCircle,
  TrendingUp,
  Plus,
  Package
} from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = params?.id;

  const [project, setProject] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'milestones' | 'vendors' | 'invoices' | 'expenses' | 'extraWork'>('milestones');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Assign Contract Form
  const [contractForm, setContractForm] = useState({
    vendorId: '',
    contractType: 'LABOUR_AND_MATERIAL',
    workType: 'Turnkey Fitout Execution',
    scopeDescription: '',
    labourAmount: '',
    materialAmount: ''
  });

  const [materialItems, setMaterialItems] = useState<any[]>([
    { materialName: '18mm BWP Marine Plywood', specification: 'CenturyPly 710 Club', quantity: 10, unit: 'sheet', unitPrice: 2200 }
  ]);

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      setProject(data);

      const vRes = await fetch('/api/vendors');
      const vData = await vRes.json();
      if (Array.isArray(vData)) {
        setVendors(vData);
        if (vData.length > 0) {
          setContractForm((prev) => ({ ...prev, vendorId: vData[0].id }));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const updateProgress = async (newPct: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressPercentage: newPct })
      });
      if (res.ok) {
        setProject({ ...project, progressPercentage: newPct });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: milestoneId, status: newStatus })
      });

      if (res.ok) {
        fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const handleAssignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.vendorId) {
      alert('Please select a Vendor / Contractor');
      return;
    }

    try {
      const res = await fetch('/api/vendors/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contractForm,
          projectId,
          materials: materialItems
        })
      });
      if (res.ok) {
        setShowAssignModal(false);
        fetchProjectData();
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

  if (!project || project.error) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p className="text-base font-bold text-slate-200">Project file not found.</p>
        <Link href="/projects" className="inline-block text-amber-400 font-semibold underline text-xs">
          Back to Projects Directory
        </Link>
      </div>
    );
  }

  // Financial aggregates
  const totalInvoiced = project.invoices?.reduce((s: number, inv: any) => s + inv.totalAmount, 0) || 0;
  const totalCollected = project.invoices?.reduce((s: number, inv: any) => {
    return s + (inv.payments?.reduce((ps: number, p: any) => ps + p.amountPaid, 0) || 0);
  }, 0) || 0;
  const totalVendorPayouts = project.vendorPayments?.reduce((s: number, vp: any) => s + vp.amount, 0) || 0;
  const totalExpenses = project.expenses?.reduce((s: number, exp: any) => s + exp.amount, 0) || 0;
  const netProjectProfit = totalCollected - (totalVendorPayouts + totalExpenses);

  return (
    <div className="space-y-6 pb-12">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Fitouts Directory
      </Link>

      {/* Main Project Header Card */}
      <div className="glass-card rounded-2xl p-6 border border-amber-500/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">{project.projectNumber}</span>
              <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Client: {project.client?.name} ({project.client?.phone})</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{project.siteAddress}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              <Plus className="w-4 h-4" /> Assign Vendor / Contractor to Project
            </button>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-medium block">Total Contract Value</span>
              <span className="text-xl font-bold text-amber-400">{formatINR(project.budget)}</span>
            </div>
          </div>
        </div>

        {/* Live Completion Slider */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Site Execution Progress</span>
            <span className="font-bold text-amber-400">{project.progressPercentage}% Completed</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={project.progressPercentage}
            onChange={(e) => updateProgress(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Financial Matrix Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Invoiced to Client</span>
          <p className="text-base font-bold text-slate-100 mt-1">{formatINR(totalInvoiced)}</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">Collected: {formatINR(totalCollected)}</p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Vendor Outflows</span>
          <p className="text-base font-bold text-slate-100 mt-1">{formatINR(totalVendorPayouts)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{project.vendorPayments?.length || 0} Payout entries</p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Site Expenses</span>
          <p className="text-base font-bold text-slate-100 mt-1">{formatINR(totalExpenses)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Petty cash & Transport</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-500/30">
          <span className="text-[10px] text-amber-400 font-semibold uppercase">Net Site Profit</span>
          <p className="text-base font-bold text-gold-gradient mt-1">{formatINR(netProjectProfit)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Realized Margin</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'milestones' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Phase Milestones ({project.milestones?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'vendors' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Vendor & Contractor Work ({project.vendorContracts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'invoices' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Invoices & Collections ({project.invoices?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'expenses' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Site Expenses ({project.expenses?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('extraWork')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'extraWork' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Extra Work Orders ({project.extraWorks?.length || 0})
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'milestones' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Work Breakdown Structure (WBS) & Milestone Controls</h3>
            <span className="text-[11px] text-amber-400 font-medium">Select dropdown to update phase status</span>
          </div>

          <div className="space-y-3">
            {project.milestones?.map((m: any) => (
              <div key={m.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {m.order}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{m.title}</h4>
                    <p className="text-[11px] text-slate-400">{m.description || 'Phase milestone task'}</p>
                  </div>
                </div>

                {/* ADMIN INTERACTIVE MILESTONE STATUS DROPDOWN */}
                <div className="flex items-center gap-3">
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border focus:outline-none cursor-pointer transition-colors ${
                      m.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : m.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    <option value="Pending">⏳ Pending</option>
                    <option value="In Progress">🚧 In Progress</option>
                    <option value="Completed">✓ Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Assigned Vendors & Contractors</h3>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Assign Vendor / Contractor
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Vendor / Contractor</th>
                  <th className="p-4">Trade Specialty</th>
                  <th className="p-4">Contract Mode</th>
                  <th className="p-4 font-bold text-amber-400">Agreed Contract Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {project.vendorContracts?.map((vc: any) => (
                  <tr key={vc.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-100">{vc.vendor?.name} ({vc.vendor?.companyName})</td>
                    <td className="p-4">
                      <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">{vc.vendor?.trade}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {vc.contractType === 'LABOUR_AND_MATERIAL' ? 'Labour + Material' : 'Labour Only'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-100">{formatINR(vc.agreedAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Milestone</th>
                <th className="p-4 font-bold text-amber-400">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {project.invoices?.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                  <td className="p-4">{inv.milestoneName}</td>
                  <td className="p-4 font-bold text-slate-100">{formatINR(inv.totalAmount)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Category</th>
                <th className="p-4 font-bold text-amber-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {project.expenses?.map((exp: any) => (
                <tr key={exp.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">{exp.title}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">{exp.category}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-100">{formatINR(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'extraWork' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Variation Title</th>
                <th className="p-4">Requested By</th>
                <th className="p-4 font-bold text-amber-400">Approved Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {project.extraWorks?.map((ew: any) => (
                <tr key={ew.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">{ew.workTitle}</td>
                  <td className="p-4 text-slate-400">{ew.requestedBy}</td>
                  <td className="p-4 font-bold text-slate-100">{formatINR(ew.approvedAmount)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {ew.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGN VENDOR / CONTRACTOR MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Assign Vendor / Contractor to Project</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignContract} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Vendor / Contractor *</label>
                <select
                  required
                  value={contractForm.vendorId}
                  onChange={(e) => setContractForm({ ...contractForm, vendorId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.trade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Subcontract Work Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContractForm({ ...contractForm, contractType: 'LABOUR_AND_MATERIAL' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      contractForm.contractType === 'LABOUR_AND_MATERIAL'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <p className="font-bold">A) Labour + Material</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Contractor supplies labour & materials</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContractForm({ ...contractForm, contractType: 'LABOUR_ONLY' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      contractForm.contractType === 'LABOUR_ONLY'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    <p className="font-bold">B) Labour Only</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Firm purchases materials as site expenses</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Labour Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={contractForm.labourAmount}
                    onChange={(e) => setContractForm({ ...contractForm, labourAmount: e.target.value })}
                    placeholder="250000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Material Amount (₹)</label>
                  <input
                    type="number"
                    value={contractForm.materialAmount}
                    onChange={(e) => setContractForm({ ...contractForm, materialAmount: e.target.value })}
                    placeholder="150000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Scope Description</label>
                <input
                  type="text"
                  value={contractForm.scopeDescription}
                  onChange={(e) => setContractForm({ ...contractForm, scopeDescription: e.target.value })}
                  placeholder="e.g. Complete Modular Kitchen carcass & POP Ceiling work"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Assign Vendor to Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
