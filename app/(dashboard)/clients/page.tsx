'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  Key,
  ShieldCheck,
  Eye,
  Building,
  Palette,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Edit2,
  Trash2
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<any>(null);

  // Client form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    propertyType: '3BHK Apartment',
    budget: '',
    notes: ''
  });

  // Creds form
  const [credsForm, setCredsForm] = useState({
    email: '',
    password: 'client123'
  });

  const fetchClients = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) {
            setActiveCompany(comp);
            compId = comp.id;
          }
        } catch (e) {}
      }

      const url = compId ? `/api/clients?companyId=${compId}` : '/api/clients';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companyId: compId })
      });
      if (res.ok) {
        setShowAddModal(false);
        setForm({
          name: '',
          email: '',
          phone: '',
          alternatePhone: '',
          address: '',
          city: '',
          propertyType: '3BHK Apartment',
          budget: '',
          notes: ''
        });
        fetchClients();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenEditClient = (client: any) => {
    setEditingClient(client);
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      alternatePhone: client.alternatePhone || '',
      address: client.address || '',
      city: client.city || '',
      propertyType: client.propertyType || '3BHK Apartment',
      budget: client.budget ? String(client.budget) : '',
      notes: client.notes || ''
    });
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget: form.budget ? parseFloat(form.budget) : undefined
        })
      });

      if (res.ok) {
        setEditingClient(null);
        setForm({
          name: '',
          email: '',
          phone: '',
          alternatePhone: '',
          address: '',
          city: '',
          propertyType: '3BHK Apartment',
          budget: '',
          notes: ''
        });
        fetchClients();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (client: any) => {
    const newStatus = client.status === 'Active' ? 'On Hold' : 'Active';
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchClients();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const res = await fetch('/api/users/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'CLIENT',
          targetId: selectedClient.id,
          name: selectedClient.name,
          email: credsForm.email,
          password: credsForm.password,
          companyId: selectedClient.companyId
        })
      });
      if (res.ok) {
        alert(`Login account created for ${selectedClient.name}!\nEmail: ${credsForm.email}\nPassword: ${credsForm.password}`);
        setShowCredsModal(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to generate credentials');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h1 className="text-2xl font-bold text-slate-100">Client Profiles & 360° Mapping</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Module 2
            </span>
            {activeCompany && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {activeCompany.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Directory of active clients, editable profiles, 360° project mapping, and portal credentials.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              name: '',
              email: '',
              phone: '',
              alternatePhone: '',
              address: '',
              city: '',
              propertyType: '3BHK Apartment',
              budget: '',
              notes: ''
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Client Profile
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 ml-2" />
          <input
            type="text"
            placeholder="Search by client name, phone number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none placeholder-slate-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <span className="font-bold text-amber-400">{filteredClients.length}</span> Active Clients
        </span>
      </div>

      {/* CLIENTS GRID */}
      {filteredClients.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-4">
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Client Profiles Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No client profiles matching active company ({activeCompany?.name || 'All'}). Click below to add a new client profile.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Client Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const clientDesigns = client.projects?.flatMap((p: any) => p.designs || []) || [];
            const pendingDesigns = clientDesigns.filter((d: any) => d.approvalStatus === 'Pending');

            return (
              <div key={client.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{client.name}</h3>
                      <p className="text-xs text-amber-400 font-semibold">{client.propertyType || 'Residential Client'}</p>
                      {client.company && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">Company: {client.company.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditClient(client)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition-colors"
                        title="Edit Client Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(client)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          client.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {client.status === 'Active' ? 'Active' : 'On Hold'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 border-t border-b border-slate-800/80 py-3">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {client.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {client.email || 'No email registered'}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {client.address || client.city || 'Site Address TBD'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs bg-slate-900/80 p-2.5 rounded-xl">
                    <span className="text-slate-400">Target Budget:</span>
                    <span className="font-bold text-amber-400 font-mono">{formatINR(client.budget)}</span>
                  </div>

                  {/* 3D RENDERS & CAD DESIGN STATUS BOX */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
                        <Palette className="w-3.5 h-3.5 text-amber-400" /> 3D Renders & CAD Blueprints
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 font-mono">
                        {clientDesigns.length} File{clientDesigns.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {pendingDesigns.length > 0 ? (
                      <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
                        <p className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-400">
                          <Clock className="w-3 h-3 animate-pulse" /> Pending Client Signoff ({pendingDesigns.length})
                        </p>
                        <p className="font-semibold truncate">
                          📄 {pendingDesigns[0].title} <span className="font-mono text-[10px] text-slate-400">({pendingDesigns[0].version})</span>
                        </p>
                      </div>
                    ) : clientDesigns.length > 0 ? (
                      <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> All uploaded assets approved
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">No 3D renders or CAD files uploaded yet</p>
                    )}

                    {clientDesigns.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDesignModal(true);
                        }}
                        className="w-full mt-1.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Uploaded 3D Renders & CAD Files ({clientDesigns.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenEditClient(client)}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                    <Link
                      href={`/clients/${client.id}`}
                      className="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
                    >
                      <Eye className="w-3.5 h-3.5" /> 360° Hub
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setCredsForm({ email: client.email || `${client.name.toLowerCase().replace(/\s+/g, '')}@interio.com`, password: 'client123' });
                      setShowCredsModal(true);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 border border-slate-800"
                  >
                    <Key className="w-3 h-3" /> Generate Portal Credentials
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3D RENDERS & CAD MODAL */}
      {showDesignModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" /> 3D Renders & CAD Blueprints
                </h3>
                <p className="text-xs text-slate-400">Client: <span className="font-bold text-slate-200">{selectedClient.name}</span></p>
              </div>
              <button onClick={() => setShowDesignModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            {(() => {
              const clientDesigns = selectedClient.projects?.flatMap((p: any) => p.designs || []) || [];
              if (clientDesigns.length === 0) {
                return (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No 3D renders or CAD blueprint files uploaded yet for this client.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {clientDesigns.map((d: any) => (
                    <div key={d.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold uppercase">
                            {d.type}
                          </span>
                          <h4 className="font-bold text-slate-100 text-sm mt-1">{d.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Version Tag: {d.version}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.approvalStatus === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : d.approvalStatus === 'Disapproved'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {d.approvalStatus === 'Approved' ? '✓ Approved' : d.approvalStatus === 'Disapproved' ? '✕ Changes Requested' : '⏳ Pending Signoff'}
                        </span>
                      </div>

                      {d.clientFeedback && (
                        <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          Client Feedback: {d.clientFeedback}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View / Download File
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* GENERATE CREDENTIALS MODAL */}
      {showCredsModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" /> Generate Portal Credentials
              </h3>
              <button onClick={() => setShowCredsModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Generate or reset login access for client: <span className="font-bold text-slate-100">{selectedClient.name}</span>
            </p>

            <form onSubmit={handleGenerateCreds} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Portal Login Email *</label>
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
                  Create Portal Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CLIENT MODAL */}
      {(showAddModal || editingClient) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {editingClient ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                {editingClient ? 'Edit Client Profile' : 'Add New Client Profile'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClient(null);
                }}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingClient ? handleUpdateClient : handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Alternate Phone</label>
                  <input
                    type="text"
                    value={form.alternatePhone}
                    onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="client@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Property Site Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Flat 1802, Wadhwa Wise City, Panvel"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Property Type</label>
                  <select
                    value={form.propertyType}
                    onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                  >
                    <option value="2BHK Apartment">2BHK Apartment</option>
                    <option value="3BHK Apartment">3BHK Apartment</option>
                    <option value="4BHK Luxury Flat">4BHK Luxury Flat</option>
                    <option value="Independent Villa">Independent Villa</option>
                    <option value="Commercial Office">Commercial Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Budget (₹)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="1500000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Client Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Client notes & specifications..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  {editingClient ? 'Save Client Changes' : 'Save Client Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
