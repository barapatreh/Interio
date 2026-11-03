'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, Calendar, Tag, Briefcase, Package, CheckCircle, Truck, ExternalLink, Receipt, FileText } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requisitions' | 'expenses'>('requisitions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProcureModal, setShowProcureModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  // Procure form
  const [procureForm, setProcureForm] = useState({
    status: 'Purchased', // 'Purchased' | 'Material Sent' | 'Delivered at Site' | 'Cancelled'
    totalPurchaseCost: '',
    invoiceUrl: '',
    purchaseNotes: ''
  });

  // Expense form
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    category: 'Materials',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchData = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const expRes = await fetch(compId ? `/api/expenses?companyId=${compId}` : '/api/expenses');
      const expData = await expRes.json();
      if (Array.isArray(expData)) setExpenses(expData);

      const reqRes = await fetch(compId ? `/api/requisitions?companyId=${compId}` : '/api/requisitions');
      const reqData = await reqRes.json();
      if (Array.isArray(reqData)) setRequisitions(reqData);

      const projRes = await fetch(compId ? `/api/projects?companyId=${compId}` : '/api/projects');
      const projData = await projRes.json();
      if (Array.isArray(projData)) {
        setProjects(projData);
        if (projData.length > 0 && !form.projectId) {
          setForm((prev) => ({ ...prev, projectId: projData[0].id }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.title || !form.amount) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm({
          projectId: projects[0]?.id || '',
          title: '',
          category: 'Materials',
          amount: '',
          expenseDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleProcureUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      const res = await fetch(`/api/requisitions/${selectedReq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(procureForm)
      });
      if (res.ok) {
        alert('Material Requisition status, purchase cost & invoice updated successfully!');
        setShowProcureModal(false);
        fetchData();
      } else {
        alert('Failed to update requisition. Please try again.');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Site Expenses & Material Procurement</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Module 10
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Process vendor material requisitions, upload purchase invoices, record purchase amounts, and track site costs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <Plus className="w-4 h-4" /> Log Site Expense
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('requisitions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requisitions'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Vendor Material Requisitions Inbox ({requisitions.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expenses'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" /> All Site Expenses ({expenses.length})
        </button>
      </div>

      {/* TAB 1: MATERIAL REQUISITIONS INBOX */}
      {activeTab === 'requisitions' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Req #</th>
                <th className="p-4">Project & Purpose</th>
                <th className="p-4">Requisition Date</th>
                <th className="p-4">Requested Material Items</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4">Purchase Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {requisitions.map((req) => (
                <tr key={req.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-amber-400">{req.requisitionNumber}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-100 block">{req.project?.title}</span>
                    <span className="text-[10px] text-amber-400">{req.purpose || 'Site Work Requisition'}</span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono">
                    {new Date(req.requisitionDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {req.items?.map((item: any) => (
                        <span key={item.id} className="block text-[11px] text-slate-200">
                          • <span className="font-bold">{item.materialName}</span> ({item.quantity} <span className="text-amber-400 font-semibold">{item.unit}</span>)
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'Delivered at Site' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      req.status === 'Material Sent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      req.status === 'Purchased' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {req.status === 'Delivered at Site' ? '🚚 Delivered at Site' :
                       req.status === 'Material Sent' ? '🚛 Material Sent' :
                       req.status === 'Purchased' ? '🛒 Purchased' : '⏳ Requested'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-100">{formatINR(req.totalPurchaseCost)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setProcureForm({
                          status: req.status === 'Requested' ? 'Purchased' : req.status,
                          totalPurchaseCost: req.totalPurchaseCost ? String(req.totalPurchaseCost) : '',
                          invoiceUrl: req.invoiceUrl || '',
                          purchaseNotes: req.purchaseNotes || ''
                        });
                        setShowProcureModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Update Status & Invoice
                    </button>
                  </td>
                </tr>
              ))}
              {requisitions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No vendor material requisitions submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: EXPENSES TABLE */}
      {activeTab === 'expenses' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Calendar Date</th>
                <th className="p-4 font-bold text-amber-400">Expense Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">
                    {exp.title}
                    {exp.notes && <span className="block text-[10px] text-slate-400 font-normal">{exp.notes}</span>}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-amber-400 font-bold">{exp.project?.projectNumber}</span>
                    <span className="block text-[11px] text-slate-300">{exp.project?.title}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 flex items-center gap-1.5 pt-5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(exp.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-amber-400 font-mono">{formatINR(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN PROCESS PROCUREMENT MODAL */}
      {showProcureModal && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Update Requisition Status & Upload Invoice</h3>
              <button onClick={() => setShowProcureModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcureUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Requisition Status *</label>
                <select
                  value={procureForm.status}
                  onChange={(e) => setProcureForm({ ...procureForm, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold"
                >
                  <option value="Purchased">🛒 Purchased by Admin</option>
                  <option value="Material Sent">🚛 Material Sent to Site</option>
                  <option value="Delivered at Site">🚚 Delivered at Site</option>
                  <option value="Cancelled">✕ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Actual Material Purchase / Sent Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={procureForm.totalPurchaseCost}
                  onChange={(e) => setProcureForm({ ...procureForm, totalPurchaseCost: e.target.value })}
                  placeholder="35000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Purchase Invoice / Bill Receipt Link or File URL</label>
                <input
                  type="text"
                  value={procureForm.invoiceUrl}
                  onChange={(e) => setProcureForm({ ...procureForm, invoiceUrl: e.target.value })}
                  placeholder="https://domain.com/bill.pdf or invoice image URL"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Procurement / Supplier Notes</label>
                <input
                  type="text"
                  value={procureForm.purchaseNotes}
                  onChange={(e) => setProcureForm({ ...procureForm, purchaseNotes: e.target.value })}
                  placeholder="Purchased from CenturyPly Distributor, Sent via Transport"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProcureModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Save Status & Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Log Site Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Active Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Expense Item Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 50 Bags Ultratech Cement / Transport Freight"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Materials">Materials & Hardware</option>
                    <option value="Transport & Freight">Transport & Freight</option>
                    <option value="Labor & Daily Wage">Labor & Daily Wage</option>
                    <option value="Permits & Approvals">Permits & Approvals</option>
                    <option value="Misc Site Cost">Misc Site Cost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Calendar Date *</label>
                  <input
                    type="date"
                    required
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Expense Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="25000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes / Vendor</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Purchased from Hardware Store"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
