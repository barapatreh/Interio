'use client';

import React, { useEffect, useState } from 'react';
import {
  Truck,
  Briefcase,
  Layers,
  Package,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  Receipt,
  Sparkles,
  FileText,
  Calendar,
  Printer,
  Upload,
  Image as ImageIcon,
  FileCode,
  ExternalLink,
  Eye
} from 'lucide-react';

export default function VendorPortalPage() {
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [requisitionDate, setRequisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalCost, setTotalCost] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [activeReqMode, setActiveReqMode] = useState<'upload' | 'itemized'>('upload');

  // Vendor Requisition Items State
  const [materials, setMaterials] = useState<any[]>([
    { materialName: '18mm BWP Marine Plywood', specification: 'CenturyPly 710 Club', quantity: 25, unit: 'sheet' }
  ]);

  const fetchVendorPortal = async () => {
    try {
      const userStr = localStorage.getItem('interio_user');
      let vendorEmail = 'vendor@interio.com';
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u?.email) vendorEmail = u.email;
        } catch (e) {}
      }

      const activeCompStr = localStorage.getItem('interio_active_company');
      if (activeCompStr) {
        try {
          const c = JSON.parse(activeCompStr);
          if (c) setCompany(c);
        } catch (e) {}
      }

      const vRes = await fetch('/api/vendors');
      const vData = await vRes.json();
      const matchedVendor = Array.isArray(vData) ? vData.find((v: any) => v.email === vendorEmail) || vData[0] : null;

      if (matchedVendor) {
        setVendorData(matchedVendor);

        // Fetch Contracts
        const cRes = await fetch('/api/vendors/contracts');
        const cData = await cRes.json();
        if (Array.isArray(cData)) {
          const vContracts = cData.filter((c: any) => c.vendorId === matchedVendor.id);
          setContracts(vContracts);
          if (vContracts.length > 0) setSelectedProjectId(vContracts[0].projectId);
        }

        // Fetch Requisitions
        const reqRes = await fetch(`/api/requisitions?vendorId=${matchedVendor.id}`);
        const reqData = await reqRes.json();
        if (Array.isArray(reqData)) setRequisitions(reqData);

        // Fetch Payments
        const pRes = await fetch('/api/vendor-payments');
        const pData = await pRes.json();
        if (Array.isArray(pData)) {
          setPayments(pData.filter((p: any) => p.vendorId === matchedVendor.id));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorPortal();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select a project site');
      return;
    }

    try {
      const res = await fetch('/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          vendorId: vendorData?.id,
          companyId: vendorData?.companyId,
          purpose: purpose || 'Material Requisition Slip Upload',
          requisitionDate,
          totalPurchaseCost: totalCost ? parseFloat(totalCost) : 0,
          attachmentUrl: attachmentUrl || null,
          uploadedBy: 'Vendor',
          items: activeReqMode === 'itemized' ? materials : []
        })
      });

      if (res.ok) {
        alert('Material Requisition & Document Slip submitted successfully!');
        setShowMaterialModal(false);
        setPurpose('');
        setTotalCost('');
        setAttachmentUrl('');
        fetchVendorPortal();
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

  const totalAgreed = contracts.reduce((s, c) => s + c.agreedAmount, 0);
  const totalReceived = payments.reduce((s, p) => s + p.amount, 0);
  const pendingPayout = totalAgreed - totalReceived;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Vendor & Contractor Portal
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 mt-2">
              Welcome, {vendorData?.name || 'Contractor Partner'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Trade Specialty: <span className="text-amber-400 font-semibold">{vendorData?.trade || 'Turnkey Subcontractor'}</span> • Contact: {vendorData?.phone}
            </p>
          </div>

          <button
            onClick={() => setShowMaterialModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Material Requisition & Bill Slip
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Total Assigned Contracts</span>
          <span className="text-xl font-bold text-slate-100 font-mono mt-1 block">{formatINR(totalAgreed)}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
          <span className="text-xs text-emerald-400 font-medium block">Received Payments</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{formatINR(totalReceived)}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
          <span className="text-xs text-amber-400 font-medium block">Pending Balance</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">{formatINR(pendingPayout)}</span>
        </div>
      </div>

      {/* MATERIAL REQUISITIONS TABLE */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 space-y-4">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" /> Submitted Material Requisitions & Bill Slips
          </h3>
          <button
            onClick={() => setShowMaterialModal(true)}
            className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Slip
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-4">Req #</th>
              <th className="p-4">Requisition Date</th>
              <th className="p-4">Project Site</th>
              <th className="p-4">Purpose / Material Slip Description</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right font-bold text-amber-400">Total Cost</th>
              <th className="p-4 text-right">Document Attachment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {requisitions.map((req) => (
              <tr key={req.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-mono font-bold text-amber-400">{req.requisitionNumber}</td>
                <td className="p-4 font-mono text-slate-400">{new Date(req.requisitionDate || req.createdAt).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-slate-100">{req.project?.title}</td>
                <td className="p-4 text-slate-300">{req.purpose}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === 'Delivered at Site'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-bold text-slate-100">
                  {req.totalPurchaseCost ? formatINR(req.totalPurchaseCost) : 'Pending Review'}
                </td>
                <td className="p-4 text-right">
                  {req.attachmentUrl ? (
                    <a
                      href={req.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700 rounded-xl inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Slip / Bill
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">No Document</span>
                  )}
                </td>
              </tr>
            ))}

            {requisitions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No material requisitions submitted yet. Click "Upload Material Requisition & Bill Slip" to submit one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* UPLOAD MATERIAL REQUISITION MODAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" /> Upload Material Requisition & Bill Slip
              </h3>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Requisition Date *</label>
                  <input
                    type="date"
                    required
                    value={requisitionDate}
                    onChange={(e) => setRequisitionDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Select Project Site *</label>
                  <select
                    required
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium"
                  >
                    {contracts.map((c) => (
                      <option key={c.id} value={c.projectId}>
                        {c.project?.projectNumber} - {c.project?.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Purpose / Material Slip Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Century Marine Plywood & Fevicol Hardware Delivery Receipt"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Total Estimated / Bill Cost (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                />
              </div>

              {/* Document Uploader Field */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Upload Image or Document Slip (PDF/JPG/PNG) *</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 bg-slate-900/60 text-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {attachmentUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      {attachmentUrl.startsWith('data:image') ? (
                        <img src={attachmentUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-amber-500/40" />
                      ) : (
                        <FileText className="w-10 h-10 text-amber-400" />
                      )}
                      <div className="text-left">
                        <p className="text-amber-400 font-bold">Document Attached!</p>
                        <p className="text-[10px] text-slate-400">Click to replace file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <ImageIcon className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-slate-300 font-bold">Click to choose image or PDF bill slip</p>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP, and PDF documents</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Submit Material Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
