'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Briefcase,
  Layers,
  Key,
  ShieldCheck,
  CheckCircle,
  Eye,
  FileSpreadsheet,
  Upload,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showReqModal, setShowReqModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  // Vendor form
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    trade: 'Turnkey General Contractor (All Work)',
    phone: '',
    email: '',
    gstin: ''
  });

  // Assign contract form
  const [contractForm, setContractForm] = useState({
    projectId: '',
    contractType: 'LABOUR_AND_MATERIAL',
    workType: 'Turnkey Execution',
    labourAmount: '',
    materialAmount: '',
    agreedAmount: '',
    scopeDescription: ''
  });

  // Requisition Form on behalf of vendor
  const [reqForm, setReqForm] = useState({
    projectId: '',
    requisitionDate: new Date().toISOString().split('T')[0],
    purpose: '',
    totalPurchaseCost: '',
    attachmentUrl: ''
  });

  // Creds form
  const [credsForm, setCredsForm] = useState({
    email: '',
    password: 'vendor123'
  });

  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [showViewReqModal, setShowViewReqModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');

  const fetchVendors = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const vUrl = compId ? `/api/vendors?companyId=${compId}` : '/api/vendors';
      const vRes = await fetch(vUrl);
      const vData = await vRes.json();
      if (Array.isArray(vData)) setVendors(vData);

      const rUrl = compId ? `/api/requisitions?companyId=${compId}` : '/api/requisitions';
      const rRes = await fetch(rUrl);
      const rData = await rRes.json();
      if (Array.isArray(rData)) setRequisitions(rData);

      const pUrl = compId ? `/api/projects?companyId=${compId}` : '/api/projects';
      const pRes = await fetch(pUrl);
      const pData = await pRes.json();
      if (Array.isArray(pData)) {
        setProjects(pData);
        if (pData.length > 0) {
          setContractForm((prev) => ({ ...prev, projectId: pData[0].id }));
          setReqForm((prev) => ({ ...prev, projectId: pData[0].id }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companyId: compId })
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm({ name: '', companyName: '', trade: 'Turnkey General Contractor (All Work)', phone: '', email: '', gstin: '' });
        fetchVendors();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleVendorStatus = async (vendor: any) => {
    const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch('/api/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, status: newStatus })
      });
      if (res.ok) fetchVendors();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !contractForm.projectId) return;

    try {
      const res = await fetch('/api/vendors/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendor.id,
          ...contractForm
        })
      });
      if (res.ok) {
        alert(`Vendor ${selectedVendor.name} assigned to project successfully!`);
        setShowAssignModal(false);
        fetchVendors();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReqForm({ ...reqForm, attachmentUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAdminUploadRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !reqForm.projectId) return;

    try {
      const res = await fetch('/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: reqForm.projectId,
          vendorId: selectedVendor.id,
          companyId: selectedVendor.companyId,
          purpose: reqForm.purpose || 'Material Requisition Slip Uploaded by Admin',
          requisitionDate: reqForm.requisitionDate,
          totalPurchaseCost: reqForm.totalPurchaseCost ? parseFloat(reqForm.totalPurchaseCost) : 0,
          attachmentUrl: reqForm.attachmentUrl || null,
          uploadedBy: 'Admin (On behalf of Vendor)'
        })
      });

      if (res.ok) {
        alert(`Material Requisition uploaded on behalf of ${selectedVendor.name}!`);
        setShowReqModal(false);
        setReqForm({ projectId: projects[0]?.id || '', requisitionDate: new Date().toISOString().split('T')[0], purpose: '', totalPurchaseCost: '', attachmentUrl: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    try {
      const res = await fetch('/api/users/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'VENDOR',
          targetId: selectedVendor.id,
          name: selectedVendor.name,
          email: credsForm.email,
          password: credsForm.password,
          companyId: selectedVendor.companyId
        })
      });
      if (res.ok) {
        alert(`Vendor login portal account created!\nEmail: ${credsForm.email}\nPassword: ${credsForm.password}`);
        setShowCredsModal(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to generate vendor login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.companyName && v.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-2xl font-bold text-slate-100">Vendors & Subcontractors Directory</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Module 8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage turnkey general contractors, trade specialists, project assignments, material requisitions, and portal credentials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Vendor / Contractor
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 ml-2" />
        <input
          type="text"
          placeholder="Search by vendor name, trade specialty (Carpentry, Electrical, Turnkey)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-200 focus:outline-none placeholder-slate-500"
        />
      </div>

      {/* VENDORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{vendor.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{vendor.companyName || 'Independent Contractor'}</p>
                </div>
                <button
                  onClick={() => handleToggleVendorStatus(vendor)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    vendor.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {vendor.status === 'Active' ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                {vendor.trade}
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 border-t border-b border-slate-800/80 py-3">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {vendor.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {vendor.email || 'No email registered'}
                </p>
                {vendor.gstin && (
                  <p className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> GST: {vendor.gstin}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Link
                href={`/vendors/${vendor.id}`}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Eye className="w-3.5 h-3.5" /> View 360° Profile & Ledger
              </Link>

              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setShowReqModal(true);
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload Requisition on Behalf of Vendor
              </button>

              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setShowViewReqModal(true);
                }}
                className="w-full py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-sky-500/30"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" /> View Requisitions & Uploaded Slips
              </button>

              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setShowAssignModal(true);
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Assign Vendor to Project
              </button>

              <button
                onClick={() => {
                  setSelectedVendor(vendor);
                  setCredsForm({ email: vendor.email || `${vendor.name.toLowerCase().replace(/\s+/g, '')}@interio.com`, password: 'vendor123' });
                  setShowCredsModal(true);
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 border border-slate-800"
              >
                <Key className="w-3 h-3" /> Generate Vendor Portal Login Access
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN UPLOAD REQUISITION ON BEHALF OF VENDOR MODAL */}
      {showReqModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" /> Upload Material Requisition Document
              </h3>
              <button onClick={() => setShowReqModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Uploading on behalf of vendor: <strong className="text-amber-400">{selectedVendor.name}</strong> ({selectedVendor.trade})
            </p>

            <form onSubmit={handleAdminUploadRequisition} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Requisition Date *</label>
                  <input
                    type="date"
                    required
                    value={reqForm.requisitionDate}
                    onChange={(e) => setReqForm({ ...reqForm, requisitionDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Select Project Site *</label>
                  <select
                    required
                    value={reqForm.projectId}
                    onChange={(e) => setReqForm({ ...reqForm, projectId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectNumber} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Purpose / Material Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Conduit & Concealed Wiring Material Slip"
                  value={reqForm.purpose}
                  onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Total Cost Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={reqForm.totalPurchaseCost}
                  onChange={(e) => setReqForm({ ...reqForm, totalPurchaseCost: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                />
              </div>

              {/* Document Uploader */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Upload Image or PDF Slip *</label>
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 bg-slate-900/60 text-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {reqForm.attachmentUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      {reqForm.attachmentUrl.startsWith('data:image') ? (
                        <img src={reqForm.attachmentUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-amber-500/40" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-amber-400" />
                      )}
                      <div className="text-left">
                        <p className="text-amber-400 font-bold">Slip Attached!</p>
                        <p className="text-[10px] text-slate-400">Click to change file</p>
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
                  onClick={() => setShowReqModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Upload Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN PROJECT MODAL */}
      {showAssignModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Assign Vendor / Contractor to Project</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Assigning: <span className="font-bold text-amber-400">{selectedVendor.name}</span> ({selectedVendor.trade})
            </p>

            <form onSubmit={handleAssignProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Project *</label>
                <select
                  required
                  value={contractForm.projectId}
                  onChange={(e) => setContractForm({ ...contractForm, projectId: e.target.value })}
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
                <label className="block text-slate-300 mb-1 font-medium">Subcontract Mode *</label>
                <select
                  value={contractForm.contractType}
                  onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                >
                  <option value="LABOUR_AND_MATERIAL">Labour + Material (Vendor Purchases Material)</option>
                  <option value="LABOUR_ONLY">Labour Only (Firm Purchases & Supplies Material)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Labour Amount (₹)</label>
                  <input
                    type="number"
                    value={contractForm.labourAmount}
                    onChange={(e) => {
                      const l = parseFloat(e.target.value || '0');
                      const m = parseFloat(contractForm.materialAmount || '0');
                      setContractForm({ ...contractForm, labourAmount: e.target.value, agreedAmount: String(l + m) });
                    }}
                    placeholder="120000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Material Amount (₹)</label>
                  <input
                    type="number"
                    value={contractForm.materialAmount}
                    onChange={(e) => {
                      const m = parseFloat(e.target.value || '0');
                      const l = parseFloat(contractForm.labourAmount || '0');
                      setContractForm({ ...contractForm, materialAmount: e.target.value, agreedAmount: String(l + m) });
                    }}
                    placeholder="80000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Total Agreed Contract Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={contractForm.agreedAmount}
                  onChange={(e) => setContractForm({ ...contractForm, agreedAmount: e.target.value })}
                  placeholder="200000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
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
                  Assign Vendor Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE VENDOR CREDENTIALS MODAL */}
      {showCredsModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" /> Generate Vendor Portal Login Access
              </h3>
              <button onClick={() => setShowCredsModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Generate portal login for vendor: <span className="font-bold text-slate-100">{selectedVendor.name}</span>
            </p>

            <form onSubmit={handleGenerateCreds} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Vendor Portal Email *</label>
                <input
                  type="email"
                  required
                  value={credsForm.email}
                  onChange={(e) => setCredsForm({ ...credsForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Set Initial Password *</label>
                <input
                  type="text"
                  required
                  value={credsForm.password}
                  onChange={(e) => setCredsForm({ ...credsForm, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCredsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Create Vendor Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Add New Vendor / Contractor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Contractor / Vendor Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Carpentry Works"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Trade Specialty *</label>
                  <select
                    value={form.trade}
                    onChange={(e) => setForm({ ...form, trade: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Turnkey General Contractor (All Work)">⭐ Turnkey General Contractor (All Work)</option>
                    <option value="Modular Carpentry & Woodwork">Modular Carpentry & Woodwork</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="False Ceiling & Gypsum">False Ceiling & Gypsum</option>
                    <option value="Civil & Tiling">Civil & Tiling</option>
                    <option value="Painting & Textures">Painting & Textures</option>
                    <option value="Plumbing & Sanitaryware">Plumbing & Sanitaryware</option>
                    <option value="Glass & Aluminium">Glass & Aluminium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Ramesh Interiors Pvt Ltd"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">GSTIN Registration</label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    placeholder="27AAACR1234F1Z5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
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
                  Save Vendor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUISITIONS & UPLOADED SLIPS VIEWER MODAL */}
      {showViewReqModal && selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-sky-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" /> Material Requisitions & Uploaded Slips
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vendor: <strong className="text-amber-400">{selectedVendor.name}</strong> ({selectedVendor.trade})
                </p>
              </div>
              <button onClick={() => setShowViewReqModal(false)} className="text-slate-400 hover:text-slate-200 font-bold p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {requisitions
                .filter((r) => r.vendorId === selectedVendor.id)
                .map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">{r.requisitionNumber}</span>
                        <span className="text-xs font-bold text-slate-100">{r.purpose}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Delivered at Site' ? 'bg-emerald-500/20 text-emerald-300' :
                          r.status === 'Purchased' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Date: {new Date(r.requisitionDate).toLocaleDateString()} • Site: <span className="text-slate-200 font-medium">{r.project?.title}</span> • By: {r.uploadedBy || 'Vendor'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-xs font-extrabold text-slate-100 font-mono block">
                          ₹{r.totalPurchaseCost?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {r.attachmentUrl ? (
                        <button
                          onClick={() => {
                            setSelectedFileUrl(r.attachmentUrl);
                            setShowFileModal(true);
                          }}
                          className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-sky-500/10"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Slip / Image
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No File Attached</span>
                      )}
                    </div>
                  </div>
                ))}

              {requisitions.filter((r) => r.vendorId === selectedVendor.id).length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 italic glass-card rounded-2xl border border-slate-800">
                  No material requisitions or slips uploaded for this vendor yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FILE VIEWER MODAL */}
      {showFileModal && selectedFileUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-sky-500/30 space-y-4 max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" /> Requisition Slip Document / Image Viewer
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
