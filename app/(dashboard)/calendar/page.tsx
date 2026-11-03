'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Briefcase,
  User,
  Trash2,
  Edit,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Palette,
  Bell
} from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [showEventModal, setShowEventModal] = useState(false);

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    eventType: 'Site Work',
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: '10:00 AM',
    priority: 'Medium',
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

      const eRes = await fetch(compId ? `/api/calendar?companyId=${compId}` : '/api/calendar');
      const eData = await eRes.json();
      if (Array.isArray(eData)) setEvents(eData);

      const pRes = await fetch(compId ? `/api/projects?companyId=${compId}` : '/api/projects');
      const pData = await pRes.json();
      if (Array.isArray(pData)) setProjects(pData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.eventDate) return;

    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, companyId: compId })
      });

      if (res.ok) {
        setShowEventModal(false);
        setForm({
          projectId: '',
          title: '',
          eventType: 'Site Work',
          eventDate: new Date().toISOString().split('T')[0],
          eventTime: '10:00 AM',
          priority: 'Medium',
          notes: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleEventStatus = async (eventId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Scheduled' : 'Completed';
    try {
      const res = await fetch('/api/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, status: nextStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event/reminder?')) return;
    try {
      const res = await fetch(`/api/calendar?id=${eventId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendWhatsAppReminder = (ev: any) => {
    const projTitle = ev.project?.title || 'Fitout Project';
    const text = `📅 *WORK REMINDER & SCHEDULE - INTERIO STUDIO*
📌 *Task*: ${ev.title}
🏷️ *Type*: ${ev.eventType} (${ev.priority} Priority)
🏗️ *Site*: ${projTitle}
⏰ *Date & Time*: ${new Date(ev.eventDate).toLocaleDateString()} at ${ev.eventTime}
📝 *Notes*: ${ev.notes || 'Please ensure site readiness.'}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredEvents = events.filter((ev) => {
    if (selectedFilter === 'ALL') return true;
    return ev.eventType === selectedFilter;
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
            <CalendarIcon className="w-4 h-4" /> Operations & Site Schedule • Module 16
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Work Calendar & Reminders</h1>
          <p className="text-xs text-slate-400">
            Schedule site inspections, client design meetings, material delivery dates, and send instant WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Create Event / Reminder
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {['ALL', 'Site Work', 'Client Meeting', 'Invoice Due', 'Vendor Payout', 'Design Signoff', 'General Reminder'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === type
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* EVENTS TIMELINE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className={`glass-card p-5 rounded-2xl border space-y-3 flex flex-col justify-between transition-all ${
              ev.status === 'Completed'
                ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                : ev.priority === 'Urgent'
                ? 'border-rose-500/40 bg-rose-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {ev.eventType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.priority === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-300'
                      : ev.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ev.priority} Priority
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 mt-1">{ev.title}</h3>
              {ev.project && <p className="text-xs text-amber-400 font-semibold">Site: {ev.project?.title}</p>}

              <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                  {new Date(ev.eventDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {ev.eventTime}
                </span>
              </div>

              {ev.notes && <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">{ev.notes}</p>}
            </div>

            {/* Event Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggleEventStatus(ev.id, ev.status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-colors ${
                  ev.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-slate-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> {ev.status}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsAppReminder(ev)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> WhatsApp
                </button>

                <button onClick={() => handleDeleteEvent(ev.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full p-12 glass-card rounded-2xl border border-slate-800 text-center text-slate-500 italic">
            No work events or reminders scheduled matching criteria. Click "Create Event / Reminder" above to add one.
          </div>
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-400" /> Create Work Event & Reminder
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Event / Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Carpentry Site Inspection"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Event Type *</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium"
                  >
                    <option value="Site Work">Site Work Inspection</option>
                    <option value="Client Meeting">Client Design Meeting</option>
                    <option value="Invoice Due">Invoice Payment Due</option>
                    <option value="Vendor Payout">Vendor Payout Date</option>
                    <option value="Design Signoff">Design Signoff Deadline</option>
                    <option value="General Reminder">General Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Priority *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Associate Project Site (Optional)</label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="">-- No Project Selected --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Event Time</label>
                  <input
                    type="text"
                    value={form.eventTime}
                    onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes & Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ensure client has approved layout option B before site visit..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Save Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
