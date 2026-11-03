'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Settings,
  Building,
  Users,
  ShieldCheck,
  Plus,
  CheckCircle,
  Save,
  Lock,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'company' | 'create-company' | 'users'>('company');
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState<any>(null);

  // Editable company settings
  const [compForm, setCompForm] = useState({
    name: '',
    code: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    letterheadUrl: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    quotationTerms: '',
    invoiceTerms: ''
  });

  // Create new company form
  const [newCompForm, setNewCompForm] = useState({
    name: '',
    code: '',
    tagline: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    gstin: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    quotationTerms: '',
    invoiceTerms: ''
  });

  // New staff user form
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN'
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

      const compRes = await fetch('/api/companies');
      const compData = await compRes.json();
      if (Array.isArray(compData)) {
        setCompanies(compData);
        localStorage.setItem('interio_companies', JSON.stringify(compData));
        const matched = compData.find((c) => c.id === compId) || compData[0];
        if (matched) {
          setSelectedComp(matched);
          setCompForm({
            name: matched.name || '',
            code: matched.code || '',
            tagline: matched.tagline || '',
            phone: matched.phone || '',
            email: matched.email || '',
            address: matched.address || '',
            logoUrl: matched.logoUrl || '',
            letterheadUrl: matched.letterheadUrl || '',
            gstin: matched.gstin || '',
            pan: matched.pan || '',
            bankName: matched.bankName || '',
            accountNumber: matched.accountNumber || '',
            ifscCode: matched.ifscCode || '',
            branch: matched.branch || '',
            quotationTerms: matched.quotationTerms || '',
            invoiceTerms: matched.invoiceTerms || ''
          });
        }
      }

      const usersRes = await fetch(compId && compId !== 'ALL' ? `/api/users?companyId=${compId}` : '/api/users');
      const usersData = await usersRes.json();
      if (Array.isArray(usersData)) setUsers(usersData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (tabQuery === 'create-company') {
      setActiveTab('create-company');
    }
  }, [tabQuery]);

  const handleSelectCompanyToEdit = (comp: any) => {
    setSelectedComp(comp);
    setCompForm({
      name: comp.name || '',
      code: comp.code || '',
      tagline: comp.tagline || '',
      phone: comp.phone || '',
      email: comp.email || '',
      address: comp.address || '',
      logoUrl: comp.logoUrl || '',
      letterheadUrl: comp.letterheadUrl || '',
      gstin: comp.gstin || '',
      pan: comp.pan || '',
      bankName: comp.bankName || '',
      accountNumber: comp.accountNumber || '',
      ifscCode: comp.ifscCode || '',
      branch: comp.branch || '',
      quotationTerms: comp.quotationTerms || '',
      invoiceTerms: comp.invoiceTerms || ''
    });
  };

  const [savingCompany, setSavingCompany] = useState(false);

  const compressImageDataUrl = (dataUrl: string, maxWidth = 1200, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !dataUrl) return resolve(dataUrl);
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(img.width * scale));
        canvas.height = Math.max(1, Math.floor(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const compressed = await compressImageDataUrl(dataUrl, 800, 0.9);
      setCompForm((prev) => ({ ...prev, logoUrl: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleLetterheadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdfDoc.getPage(1);
        
        // Scale to 1200px width for crisp print resolution while maintaining compact data URL size
        const rawViewport = page.getViewport({ scale: 1.0 });
        const scale = Math.min(1.8, 1200 / rawViewport.width);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: context, viewport }).promise;
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCompForm((prev) => ({ ...prev, letterheadUrl: compressedDataUrl }));
          return;
        }
      } catch (pdfErr) {
        console.warn('PDF conversion fallback to raw data URL:', pdfErr);
      }
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const compressed = await compressImageDataUrl(dataUrl, 1200, 0.85);
      setCompForm((prev) => ({ ...prev, letterheadUrl: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComp) return;

    setSavingCompany(true);
    try {
      // Compress URLs before saving if needed
      const payload = { ...compForm };
      if (payload.letterheadUrl && payload.letterheadUrl.startsWith('data:image')) {
        payload.letterheadUrl = await compressImageDataUrl(payload.letterheadUrl, 1200, 0.85);
      }
      if (payload.logoUrl && payload.logoUrl.startsWith('data:image')) {
        payload.logoUrl = await compressImageDataUrl(payload.logoUrl, 800, 0.9);
      }

      const res = await fetch(`/api/companies/${selectedComp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        alert(`Company profile & letterhead for "${updated.name}" updated successfully!`);
        await fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save company profile: ${errData.error || res.statusText}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Error saving company settings: ${error?.message || 'Network error'}`);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompForm)
      });
      if (res.ok) {
        const created = await res.json();
        alert(`Company "${created.name}" created successfully!`);
        setNewCompForm({
          name: '',
          code: '',
          tagline: '',
          phone: '',
          email: '',
          website: '',
          address: '',
          gstin: '',
          pan: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          branch: '',
          quotationTerms: '',
          invoiceTerms: ''
        });
        await fetchData();
        setActiveTab('company');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userForm,
          companyId: selectedComp?.id
        })
      });
      if (res.ok) {
        setUserForm({ name: '', email: '', password: '', role: 'ADMIN' });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const staffUsers = users.filter((u) => u.role !== 'CLIENT' && u.role !== 'VENDOR');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-100">Multi-Company Settings & Staff Access Control</h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {companies.length} Registered Companies
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Create multiple studios/companies, manage logos, bank details, and staff role-based access permissions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'company' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" /> Edit Company Profiles ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('create-company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'create-company' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" /> + Register New Company
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Staff RBAC Accounts ({staffUsers.length})
        </button>
      </div>

      {/* TAB 1: EDIT EXISTING COMPANIES */}
      {activeTab === 'company' && selectedComp && (
        <div className="space-y-6">
          {/* Company Selector */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Editing Studio Profile</p>
                <p className="text-sm font-bold text-slate-100">{selectedComp.name} ({selectedComp.code})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Company:</span>
              <select
                value={selectedComp.id}
                onChange={(e) => {
                  const comp = companies.find((c) => c.id === e.target.value);
                  if (comp) handleSelectCompanyToEdit(comp);
                }}
                className="bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleUpdateCompany} className="space-y-6">
            {/* LOGO & LETTERHEAD BANNER UPLOAD SECTION */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Studio Branding & Official Printed Letterhead Settings
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure your official brand logo and custom printed letterhead header banner for PDF Proposals, Invoices & Client Briefs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Block 1: Studio Brand Logo */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">1. Studio Brand Logo</span>
                    {compForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setCompForm((prev) => ({ ...prev, logoUrl: '' }))}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  <div className="h-24 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2">
                    {compForm.logoUrl ? (
                      <img src={compForm.logoUrl} alt="Studio Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[11px] text-slate-500 font-semibold">No Logo Uploaded</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700">
                      <Upload className="w-3.5 h-3.5 text-amber-400" /> Upload Studio Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="https://.../logo.png"
                      value={compForm.logoUrl}
                      onChange={(e) => setCompForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Block 2: Full Corporate Letterhead Image */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-400">2. Corporate Letterhead Banner Image</span>
                    {compForm.letterheadUrl && (
                      <button
                        type="button"
                        onClick={() => setCompForm((prev) => ({ ...prev, letterheadUrl: '' }))}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Remove Letterhead
                      </button>
                    )}
                  </div>

                  <div className="h-24 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2 overflow-hidden">
                    {compForm.letterheadUrl ? (
                      compForm.letterheadUrl.startsWith('data:application/pdf') || compForm.letterheadUrl.endsWith('.pdf') ? (
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-300 font-bold block">PDF Letterhead Document Loaded</span>
                        </div>
                      ) : (
                        <img src={compForm.letterheadUrl} alt="Letterhead Header" className="w-full h-full object-contain rounded" />
                      )
                    ) : (
                      <div className="text-center p-2">
                        <Building className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-[11px] text-slate-500 font-semibold block">No PDF or Image Letterhead Loaded</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
                      <Upload className="w-3.5 h-3.5" /> Upload Letterhead (PDF / Image)
                      <input type="file" accept="image/*,application/pdf,.pdf" onChange={handleLetterheadUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      placeholder="https://.../official-letterhead.pdf or .png"
                      value={compForm.letterheadUrl}
                      onChange={(e) => setCompForm((prev) => ({ ...prev, letterheadUrl: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Upload PDF letterhead file (.pdf) or image header (.png, .jpg, .svg)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" /> Firm Identity & GST Registration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={compForm.name}
                    onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Studio Tagline</label>
                  <input
                    type="text"
                    value={compForm.tagline}
                    onChange={(e) => setCompForm({ ...compForm, tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Official Phone</label>
                  <input
                    type="text"
                    value={compForm.phone}
                    onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Official Email</label>
                  <input
                    type="email"
                    value={compForm.email}
                    onChange={(e) => setCompForm({ ...compForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">GSTIN Registration</label>
                  <input
                    type="text"
                    value={compForm.gstin}
                    onChange={(e) => setCompForm({ ...compForm, gstin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">PAN Number</label>
                  <input
                    type="text"
                    value={compForm.pan}
                    onChange={(e) => setCompForm({ ...compForm, pan: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium text-xs">Studio Office Address</label>
                <input
                  type="text"
                  value={compForm.address}
                  onChange={(e) => setCompForm({ ...compForm, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* BANK ACCOUNT DETAILS FOR PROPOSAL / INVOICE PRINTING */}
            <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" /> Bank Transfer Credentials (Printed on Proposals & Invoices)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Bank Name *</label>
                  <input
                    type="text"
                    value={compForm.bankName}
                    onChange={(e) => setCompForm({ ...compForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank Ltd."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Account Number *</label>
                  <input
                    type="text"
                    value={compForm.accountNumber}
                    onChange={(e) => setCompForm({ ...compForm, accountNumber: e.target.value })}
                    placeholder="50200098765432"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">IFSC Code *</label>
                  <input
                    type="text"
                    value={compForm.ifscCode}
                    onChange={(e) => setCompForm({ ...compForm, ifscCode: e.target.value })}
                    placeholder="HDFC0000123"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Branch Location</label>
                  <input
                    type="text"
                    value={compForm.branch}
                    onChange={(e) => setCompForm({ ...compForm, branch: e.target.value })}
                    placeholder="BKC Branch, Mumbai"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingCompany}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingCompany ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> Saving Studio Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Studio Logo, Letterhead & Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REGISTER NEW COMPANY */}
      {activeTab === 'create-company' && (
        <form onSubmit={handleCreateCompany} className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Register New Studio / Sister Firm
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a new company or brand to your multi-company portal. Admin can view and switch between all registered companies from the top navigation header.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Interio Architectural Fitouts"
                value={newCompForm.name}
                onChange={(e) => setNewCompForm({ ...newCompForm, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Company Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. INT-ARCH"
                value={newCompForm.code}
                onChange={(e) => setNewCompForm({ ...newCompForm, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Studio Tagline</label>
              <input
                type="text"
                placeholder="e.g. Turnkey Corporate Interiors"
                value={newCompForm.tagline}
                onChange={(e) => setNewCompForm({ ...newCompForm, tagline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Official Phone</label>
              <input
                type="text"
                placeholder="+91 98200 12345"
                value={newCompForm.phone}
                onChange={(e) => setNewCompForm({ ...newCompForm, phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Official Email</label>
              <input
                type="email"
                placeholder="info@interioarch.com"
                value={newCompForm.email}
                onChange={(e) => setNewCompForm({ ...newCompForm, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Website</label>
              <input
                type="text"
                placeholder="www.interioarch.com"
                value={newCompForm.website}
                onChange={(e) => setNewCompForm({ ...newCompForm, website: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">GSTIN Number</label>
              <input
                type="text"
                placeholder="27AAAAA1234A1Z5"
                value={newCompForm.gstin}
                onChange={(e) => setNewCompForm({ ...newCompForm, gstin: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">PAN Number</label>
              <input
                type="text"
                placeholder="AAAAA1234A"
                value={newCompForm.pan}
                onChange={(e) => setNewCompForm({ ...newCompForm, pan: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-xs">Studio Office Address</label>
            <input
              type="text"
              placeholder="Suite 101, Commercial Complex, Mumbai"
              value={newCompForm.address}
              onChange={(e) => setNewCompForm({ ...newCompForm, address: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Bank Transfer Details for Proposal/Invoice Printing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Bank Name</label>
                <input
                  type="text"
                  placeholder="HDFC Bank Ltd."
                  value={newCompForm.bankName}
                  onChange={(e) => setNewCompForm({ ...newCompForm, bankName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Account Number</label>
                <input
                  type="text"
                  placeholder="50200011223344"
                  value={newCompForm.accountNumber}
                  onChange={(e) => setNewCompForm({ ...newCompForm, accountNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">IFSC Code</label>
                <input
                  type="text"
                  placeholder="HDFC0000123"
                  value={newCompForm.ifscCode}
                  onChange={(e) => setNewCompForm({ ...newCompForm, ifscCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Branch Location</label>
                <input
                  type="text"
                  placeholder="BKC Branch, Mumbai"
                  value={newCompForm.branch}
                  onChange={(e) => setNewCompForm({ ...newCompForm, branch: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Company & Add to Portal
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: STAFF RBAC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Create Staff User Form */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Create Staff Member User Account
            </h3>

            <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Staff Full Name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
              <div className="flex gap-2">
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-slate-100 font-bold"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SALES">SALES</option>
                  <option value="DESIGNER">DESIGNER</option>
                  <option value="PROJECT_MANAGER">PROJECT MANAGER</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl whitespace-nowrap"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>

          {/* STAFF RBAC TABLE (Excludes Client & Vendor Users) */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Active Staff Users & Status Controls
              </h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Staff Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Login Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {staffUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-100">{u.name}</td>
                    <td className="p-4 font-mono text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status || 'Active')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors ${
                          u.status === 'Active'
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                      >
                        {u.status === 'Active' ? 'Deactivate Login' : 'Activate Login'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
