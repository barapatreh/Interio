'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  ArrowLeft,
  Briefcase,
  Layers,
  Package,
  CreditCard,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  Key,
  Building,
  FileSpreadsheet,
  Printer,
  Receipt,
  Calendar
} from 'lucide-react';

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendorId = params?.id;

  const [vendor, setVendor] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ledger' | 'contracts' | 'requisitions' | 'payments'>('ledger');
  const [showProcureModal, setShowProcureModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');

  // Procure form state
  const [procureForm, setProcureForm] = useState({
    status: 'Purchased',
    purchasedAt: new Date().toISOString().split('T')[0],
    totalPurchaseCost: '',
    invoiceUrl: '',
    purchaseNotes: ''
  });

  const fetchVendorDetailData = async () => {
    if (!vendorId) return;

    try {
      const [vData, cData, rData, pData] = await Promise.all([
        fetch(`/api/vendors`).then((res) => res.json()),
        fetch(`/api/vendors/contracts`).then((res) => res.json()),
        fetch(`/api/requisitions?vendorId=${vendorId}`).then((res) => res.json()),
        fetch(`/api/vendor-payments`).then((res) => res.json())
      ]);

      if (Array.isArray(vData)) {
        const found = vData.find((v: any) => v.id === vendorId);
        setVendor(found);
      }
      if (Array.isArray(cData)) setContracts(cData.filter((c: any) => c.vendorId === vendorId));
      if (Array.isArray(rData)) setRequisitions(rData);
      if (Array.isArray(pData)) setPayments(pData.filter((p: any) => p.vendorId === vendorId));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorDetailData();
  }, [vendorId]);

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
        alert('Material requisition status, purchase bill date & amount updated successfully!');
        setShowProcureModal(false);
        fetchVendorDetailData();
      } else {
        alert('Failed to update requisition.');
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

  if (!vendor) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <p className="text-base font-bold text-slate-200">Vendor / Contractor record not found.</p>
        <Link href="/vendors" className="inline-block text-amber-400 font-semibold underline text-xs">
          Back to Vendors Directory
        </Link>
      </div>
    );
  }

  const totalAgreed = contracts.reduce((s, c) => s + c.agreedAmount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const pendingLiability = totalAgreed - totalPaid;

  // Build Chronological Ledger Entries
  const ledgerEntries: any[] = [];
  contracts.forEach((c) => {
    ledgerEntries.push({
      id: c.id,
      date: c.createdAt,
      type: 'WORK_CONTRACT',
      title: `Contract: ${c.project?.title || 'Site Work'} (${c.workType})`,
      debit: c.agreedAmount,
      credit: 0,
      ref: c.project?.projectNumber || 'INT-PROJ'
    });
  });
  payments.forEach((p) => {
    ledgerEntries.push({
      id: p.id,
      date: p.paymentDate,
      type: 'PAYMENT_PAID',
      title: `Payout: ${p.paymentMode} (${p.category || 'Labour/Material'})`,
      debit: 0,
      credit: p.amount,
      ref: p.transactionRef || 'BANK-TXN'
    });
  });
  ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const computedLedger = ledgerEntries.map((e) => {
    runningBalance += e.debit - e.credit;
    return { ...e, runningBalance };
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vendors Directory
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
        >
          <Printer className="w-4 h-4" /> Export / Print Vendor Ledger
        </button>
      </div>

      {/* Main Vendor Header Banner */}
      <div className="glass-card rounded-3xl p-6 border border-amber-500/20 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {vendor.trade}
              </span>
              <h1 className="text-2xl font-bold text-slate-100">{vendor.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                vendor.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {vendor.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span className="font-semibold text-slate-200">{vendor.companyName || 'Independent Contractor'}</span>
              <span>•</span>
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{vendor.phone}</span>
              <span>•</span>
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{vendor.email || 'N/A'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Work Value</span>
              <span className="text-lg font-bold text-slate-100 font-mono">{formatINR(totalAgreed)}</span>
            </div>
            <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/30 text-right">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Total Paid Out</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{formatINR(totalPaid)}</span>
            </div>
            <div className="bg-amber-950/20 p-3 rounded-2xl border border-amber-500/30 text-right">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Net Payable Liability</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{formatINR(pendingLiability)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'ledger' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Statement of Account & Ledger ({computedLedger.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'contracts' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Project Contracts ({contracts.length})
        </button>
        <button
          onClick={() => setActiveTab('requisitions')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'requisitions' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Material Requisitions ({requisitions.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'payments' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          Payout Receipts ({payments.length})
        </button>
      </div>

      {/* TAB 1: LEDGER */}
      {activeTab === 'ledger' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 space-y-4">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Vendor Work & Payment Ledger (Statement of Account)
            </h3>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction Date</th>
                <th className="p-4">Transaction Details</th>
                <th className="p-4">Reference #</th>
                <th className="p-4 text-right">Work Debit (Payable)</th>
                <th className="p-4 text-right text-emerald-400">Payment Credit (Paid)</th>
                <th className="p-4 text-right font-bold text-amber-400">Running Payable Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {computedLedger.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono text-slate-400">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-100">{row.title}</td>
                  <td className="p-4 font-mono text-amber-400">{row.ref}</td>
                  <td className="p-4 text-right font-mono font-semibold text-slate-200">
                    {row.debit > 0 ? formatINR(row.debit) : '—'}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-emerald-400">
                    {row.credit > 0 ? formatINR(row.credit) : '—'}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-amber-400">
                    {formatINR(row.runningBalance)}
                  </td>
                </tr>
              ))}
              {computedLedger.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No ledger transactions recorded for this vendor yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Assigned Project</th>
                <th className="p-4">Contract Mode</th>
                <th className="p-4">Labour Cost</th>
                <th className="p-4">Material Cost</th>
                <th className="p-4 font-bold text-amber-400">Total Contract Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-slate-100">
                    {c.project?.title}
                    <span className="block text-[10px] text-amber-400 font-mono">{c.project?.projectNumber}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {c.contractType === 'LABOUR_AND_MATERIAL' ? 'Labour + Material' : 'Labour Only'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{formatINR(c.labourAmount || c.agreedAmount)}</td>
                  <td className="p-4 font-semibold text-slate-200">{formatINR(c.materialAmount)}</td>
                  <td className="p-4 font-bold text-amber-400">{formatINR(c.agreedAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: REQUISITIONS WITH ADMIN PROCUREMENT UPDATE BUTTON */}
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
                <th className="p-4">Purchase Bill Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {requisitions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-amber-400">{r.requisitionNumber}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-100 block">{r.project?.title}</span>
                    <span className="text-[10px] text-amber-400">{r.purpose || 'Site Procurement'}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{new Date(r.requisitionDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {r.items?.map((item: any) => (
                        <span key={item.id} className="block text-[11px] text-slate-200">
                          • {item.materialName} ({item.quantity} <span className="text-amber-400 font-semibold">{item.unit}</span>)
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Delivered at Site' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      r.status === 'Material Sent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      r.status === 'Purchased' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {r.status === 'Delivered at Site' ? '🚚 Delivered at Site' :
                       r.status === 'Material Sent' ? '🚛 Material Sent' :
                       r.status === 'Purchased' ? '🛒 Purchased' : '⏳ Requested'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-100">{formatINR(r.totalPurchaseCost)}</td>
                  <td className="p-4 text-right space-x-2">
                    {r.attachmentUrl && (
                      <button
                        onClick={() => {
                          setSelectedFileUrl(r.attachmentUrl);
                          setShowFileModal(true);
                        }}
                        className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> View Slip / File
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedReq(r);
                        setProcureForm({
                          status: r.status === 'Requested' ? 'Purchased' : r.status,
                          purchasedAt: r.purchasedAt ? new Date(r.purchasedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                          totalPurchaseCost: r.totalPurchaseCost ? String(r.totalPurchaseCost) : '',
                          invoiceUrl: r.invoiceUrl || '',
                          purchaseNotes: r.purchaseNotes || ''
                        });
                        setShowProcureModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Process Purchase & Bill
                    </button>
                  </td>
                </tr>
              ))}
              {requisitions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No material requisitions submitted by this vendor yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Project</th>
                <th className="p-4">Payment Mode</th>
                <th className="p-4">Txn Ref</th>
                <th className="p-4 font-bold text-emerald-400">Paid Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono text-slate-400">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-100">{p.project?.title}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">{p.paymentMode}</span>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{p.transactionRef || 'N/A'}</td>
                  <td className="p-4 font-bold text-emerald-400 font-mono">{formatINR(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN PROCESS PROCUREMENT MODAL IN VENDOR HUB */}
      {showProcureModal && selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Process Material Purchase & Update Status</h3>
              <button onClick={() => setShowProcureModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcureUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Update Requisition Status *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Purchase Bill Date *</label>
                  <input
                    type="date"
                    required
                    value={procureForm.purchasedAt}
                    onChange={(e) => setProcureForm({ ...procureForm, purchasedAt: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Purchase Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={procureForm.totalPurchaseCost}
                    onChange={(e) => setProcureForm({ ...procureForm, totalPurchaseCost: e.target.value })}
                    placeholder="35000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Purchase Bill Invoice Link or File URL</label>
                <input
                  type="text"
                  value={procureForm.invoiceUrl}
                  onChange={(e) => setProcureForm({ ...procureForm, invoiceUrl: e.target.value })}
                  placeholder="https://domain.com/bill.pdf or invoice image URL"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Supplier / Procurement Notes</label>
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
                  Save Purchase & Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILE VIEWER MODAL */}
      {showFileModal && selectedFileUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-sky-500/30 space-y-4 max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" /> Requisition Slip Document / Image Viewer
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={selectedFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  Download / Open Original File
                </a>
                <button onClick={() => setShowFileModal(false)} className="text-slate-400 hover:text-slate-200 font-bold p-1">
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-800 min-h-[60vh]">
              {selectedFileUrl.endsWith('.pdf') ? (
                <iframe src={selectedFileUrl} className="w-full h-full min-h-[60vh] rounded-xl" title="Requisition PDF" />
              ) : (
                <img src={selectedFileUrl} alt="Requisition Document Slip" className="max-h-[70vh] object-contain rounded-xl shadow-2xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
