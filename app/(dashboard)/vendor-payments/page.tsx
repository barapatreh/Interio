'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Truck,
  DollarSign,
  Briefcase,
  FileText,
  Printer,
  CheckCircle,
  Building
} from 'lucide-react';

export default function VendorPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: '',
    projectId: '',
    amount: '',
    paymentMode: 'Bank Transfer',
    category: 'Labour',
    notes: '',
    transactionRef: ''
  });

  const fetchData = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) {
            setCompany(comp);
            compId = comp.id;
          }
        } catch (e) {}
      }

      const [vpRes, vRes, pRes] = await Promise.all([
        fetch('/api/vendor-payments').then((r) => r.json()),
        fetch('/api/vendors').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json())
      ]);
      setPayments(vpRes);
      setVendors(vRes);
      setProjects(pRes);
      if (vRes.length > 0) setFormData((prev) => ({ ...prev, vendorId: vRes[0].id }));
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

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = '';
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id) compId = comp.id;
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/vendor-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId: compId })
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <CreditCard className="w-4 h-4" /> Contractor Ledger • Module 9
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Vendor Payment Ledger & Voucher Slips</h1>
          <p className="text-xs text-slate-400">
            Record payouts made to contractors and print official Vendor Payment Vouchers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Record Vendor Payout
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor name, project, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Payment Date</th>
              <th className="p-4">Vendor & Trade</th>
              <th className="p-4">Project Site</th>
              <th className="p-4">Category</th>
              <th className="p-4">Mode & Ref</th>
              <th className="p-4 font-bold text-amber-400">Amount Paid</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-mono text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-100">{p.vendor?.name}</div>
                  <div className="text-[10px] text-amber-400 font-medium">{p.vendor?.trade}</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-slate-200">{p.project?.title}</div>
                  <div className="text-[10px] text-slate-400">{p.project?.client?.name}</div>
                </td>
                <td className="p-4">
                  <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                    {p.category}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-slate-300">{p.paymentMode}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.transactionRef || 'N/A'}</div>
                </td>
                <td className="p-4 font-bold text-amber-400 text-sm">{formatINR(p.amount)}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedPayment(p);
                      setShowSlipModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> View Payment Slip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-amber-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" /> Record Vendor Payout Entry
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayout} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Vendor Contractor *</label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.trade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Project Site *</label>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payout Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Labour">Labour Work</option>
                    <option value="Material">Material Supply</option>
                    <option value="Subcontracting">Subcontract Turnkey</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Transaction Reference</label>
                  <input
                    type="text"
                    placeholder="IMPS-9922088"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Payout Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Carcase framing completion payout"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR PAYMENT VOUCHER SLIP MODAL */}
      {showSlipModal && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Contractor Payment Voucher Slip</h3>
                <p className="text-xs text-slate-400">Voucher Ref: {selectedPayment.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Payment Slip
                </button>
                <button onClick={() => setShowSlipModal(false)} className="text-slate-400 hover:text-slate-200 p-2">
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Voucher Canvas */}
            <div className="printable-area bg-white text-slate-900 p-8 rounded-2xl shadow-2xl space-y-6 font-sans text-xs select-text">
              <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {company?.logoUrl && (
                    <img src={company.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                  )}
                  <div>
                    <h1 className="text-xl font-extrabold text-amber-600">{company?.name || 'INTERIO LUXURY FITOUTS'}</h1>
                    <p className="text-slate-600 font-semibold">Contractor Payout Payment Slip / Receipt</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-slate-900 text-amber-400 font-mono font-bold text-xs rounded">
                    PAYMENT SLIP
                  </span>
                  <p className="text-[11px] text-slate-500 mt-2">Date: {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Paid To Contractor / Vendor:</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPayment.vendor?.name}</p>
                  <p className="text-slate-600 font-semibold">{selectedPayment.vendor?.companyName || selectedPayment.vendor?.trade}</p>
                  <p className="text-[11px] text-slate-500">Phone: {selectedPayment.vendor?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Turnkey Project Site:</p>
                  <p className="text-xs font-bold text-slate-800">{selectedPayment.project?.title}</p>
                  <p className="text-[11px] text-slate-500">Client: {selectedPayment.project?.client?.name}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-2.5 border-r border-slate-200">Work Category</th>
                    <th className="p-2.5 border-r border-slate-200">Payment Mode & Ref</th>
                    <th className="p-2.5 border-r border-slate-200">Notes</th>
                    <th className="p-2.5 text-right font-bold">Amount Paid (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border-r border-slate-200 font-bold text-amber-800">{selectedPayment.category}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono">
                      {selectedPayment.paymentMode} ({selectedPayment.transactionRef || 'N/A'})
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600">{selectedPayment.notes || 'Contractor milestone payout'}</td>
                    <td className="p-2.5 text-right font-bold font-mono text-emerald-700">₹{selectedPayment.amount?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-end pt-6 border-t border-slate-300">
                <div className="text-center w-40 border-t border-slate-400 pt-2 text-[10px] text-slate-600 font-bold">
                  Contractor Signature / Seal
                </div>
                <div className="text-center w-40 border-t border-slate-400 pt-2 text-[10px] text-slate-600 font-bold">
                  Authorized Manager Sign
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
