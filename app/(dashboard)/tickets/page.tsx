'use client';

import React, { useEffect, useState } from 'react';
import {
  LifeBuoy,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Building,
  User,
  CheckSquare
} from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const [resolveForm, setResolveForm] = useState({
    status: 'Resolved',
    adminNotes: ''
  });

  const fetchTickets = async () => {
    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const res = await fetch(compId ? `/api/tickets?companyId=${compId}` : '/api/tickets');
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: resolveForm.status,
          adminNotes: resolveForm.adminNotes
        })
      });

      if (res.ok) {
        setShowResolveModal(false);
        fetchTickets();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" /> Client Support & Operations • Module 15
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Support & Site Issue Tickets</h1>
          <p className="text-xs text-slate-400">
            Review client raised tickets, update execution snag status, and respond with resolution notes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ticket #, client, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Open', 'Under Review', 'In Progress', 'Resolved', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Ticket #</th>
              <th className="p-4">Client & Project Site</th>
              <th className="p-4">Category & Subject</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Admin Response Notes</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredTickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-mono font-bold text-amber-400">{t.ticketNumber}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-100">{t.client?.name}</div>
                  <div className="text-[10px] text-slate-400">{t.project?.title || 'General Query'}</div>
                </td>
                <td className="p-4">
                  <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {t.category}
                  </span>
                  <p className="font-bold text-slate-100 mt-1">{t.subject}</p>
                  <p className="text-[10px] text-slate-400">{t.description}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    t.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : t.status === 'Under Review'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-[11px] text-slate-300 italic font-medium">{t.adminNotes || 'No notes added yet'}</p>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setResolveForm({
                        status: t.status === 'Open' ? 'Under Review' : t.status,
                        adminNotes: t.adminNotes || ''
                      });
                      setShowResolveModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl font-bold text-xs inline-flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Manage Ticket
                  </button>
                </td>
              </tr>
            ))}

            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No support tickets found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RESOLVE / UPDATE TICKET MODAL */}
      {showResolveModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" /> Update Ticket #{selectedTicket.ticketNumber}
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-300 font-bold">{selectedTicket.subject}</p>
                <p className="text-slate-400 text-[11px]">Client: {selectedTicket.client?.name} • Category: {selectedTicket.category}</p>
                <p className="text-slate-400 text-[11px]">Description: {selectedTicket.description}</p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Update Ticket Status *</label>
                <select
                  value={resolveForm.status}
                  onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress (Engineer Assigned)</option>
                  <option value="Resolved">Resolved (Snag Fixed)</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Admin Resolution / Response Notes for Client *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Site engineer visited and rectified the wardrobe handle alignment snag. Verification complete."
                  value={resolveForm.adminNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, adminNotes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Save & Update Ticket Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
