'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  Building,
  DollarSign,
  Sparkles,
  ArrowRight,
  Eye,
  Trash2,
  Edit,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pdfTemplate, setPdfTemplate] = useState<'gold' | 'minimal' | 'royal' | 'grid'>('gold');
  const [printMode, setPrintMode] = useState<'detailed' | 'summary'>('detailed');
  const [letterheadMode, setLetterheadMode] = useState<'full' | 'banner' | 'blank'>('full');
  const [pdfPriceMode, setPdfPriceMode] = useState<'with_price' | 'list_only'>('with_price');

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

      // Fetch fresh company details
      try {
        const compRes = await fetch('/api/companies');
        const compData = await compRes.json();
        if (Array.isArray(compData) && compData.length > 0) {
          const matched = compId ? compData.find((c: any) => c.id === compId) || compData[0] : compData[0];
          if (matched) setCompany(matched);
        }
      } catch (err) {}

      const url = compId ? `/api/quotations?companyId=${compId}` : '/api/quotations';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setQuotations(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('interio_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.role === 'DESIGNER') {
          router.push('/designs');
          return;
        }
      } catch (e) {}
    }
    fetchData();
  }, []);

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/quotations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quoteId, status: newStatus })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to update quotation status');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConvertToProject = async (quoteId: string) => {
    if (!confirm('Convert this quotation proposal into an active Fitout Project?')) return;
    try {
      const res = await fetch(`/api/quotations/${quoteId}/convert`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Success! Quotation accepted & converted to Fitout Project (${data.project?.projectNumber || 'Active'}).`);
        fetchData();
        router.push('/projects');
      } else {
        alert(data.error || 'Failed to convert quotation to project.');
      }
    } catch (error) {
      console.error(error);
      alert('Error converting quotation to project.');
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.siteAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || q.status === filterStatus;
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Cost Estimations • Module 4
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Quotations & Proposals</h1>
          <p className="text-xs text-slate-400">
            Build room-by-room interior cost estimates, update proposal status, export PDF documents, and convert quotes to fitout projects.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Proposal
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search quote #, client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'Draft', 'Sent', 'Accepted', 'Rejected', 'Converted'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterStatus === st
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
              <th className="p-4">Quote Number</th>
              <th className="p-4">Client Name</th>
              <th className="p-4">Created Date</th>
              <th className="p-4">Valid Till Date</th>
              <th className="p-4">Proposal Status</th>
              <th className="p-4 text-right font-bold text-amber-400">Grand Total</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredQuotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-mono font-bold text-amber-400">{q.quoteNumber}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-100">{q.clientName}</div>
                  <div className="text-[10px] text-slate-400">{q.siteAddress}</div>
                </td>
                <td className="p-4 font-mono text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</td>
                <td className="p-4 font-mono text-slate-400">
                  {q.validUntilDate ? new Date(q.validUntilDate).toLocaleDateString() : `${q.validityDays || 30} Days`}
                </td>
                <td className="p-4">
                  {/* Interactive Status Selector */}
                  <select
                    value={q.status || 'Draft'}
                    onChange={(e) => handleStatusChange(q.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-900 border cursor-pointer focus:outline-none transition-all ${
                      q.status === 'Accepted' || q.status === 'Converted'
                        ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30'
                        : q.status === 'Rejected'
                        ? 'text-rose-300 border-rose-500/40 bg-rose-950/30'
                        : q.status === 'Sent'
                        ? 'text-sky-300 border-sky-500/40 bg-sky-950/30'
                        : 'text-slate-300 border-slate-700'
                    }`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent to Client</option>
                    <option value="Accepted">Accepted by Client</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Converted">Converted to Project</option>
                  </select>
                </td>
                <td className="p-4 text-right font-bold text-slate-100 text-sm">{formatINR(q.grandTotal)}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedQuote(q);
                      setShowPrintModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" /> Export PDF
                  </button>

                  <Link
                    href={`/quotations/new?id=${q.id}`}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl inline-flex items-center gap-1 transition-all"
                    title="Edit Quotation Proposal"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                  </Link>

                  <button
                    onClick={() => {
                      const clientName = q.client?.name || q.clientName || 'Valued Client';
                      const total = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(q.grandTotal || 0);
                      const text = `📋 *INTERIOR FITOUT ESTIMATE & PROPOSAL*\nProposal #: ${q.quoteNumber}\nClient: ${clientName}\nScope: ${q.title || 'Turnkey Interior Project'}\nGrand Total: ${total}\n\nView Proposal Online: ${window.location.origin}/client-portal`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl inline-flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> WhatsApp
                  </button>

                  {q.status === 'Converted' ? (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Project Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvertToProject(q.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 shadow-md shadow-emerald-600/20"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> Convert to Project
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredQuotes.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No proposals found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PROPOSAL PDF PRINT & EXPORT MODAL WITH EXACT 1:1 TEMPLATE LAYOUT */}
      {showPrintModal && selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-6 max-h-[95vh] overflow-y-auto">
            {/* Top Toolbar Header (Hidden during print) */}
            <div className="flex flex-col space-y-3 border-b border-slate-800 pb-4 no-print">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Proposal Export & Print Center</h3>
                  <p className="text-xs text-slate-400">Quote #{selectedQuote.quoteNumber}</p>
                </div>

                {/* PDF Price Format Controls */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
                  <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">PDF Format:</span>
                  <button
                    onClick={() => setPdfPriceMode('with_price')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      pdfPriceMode === 'with_price' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    💰 Product List with Price
                  </button>
                  <button
                    onClick={() => setPdfPriceMode('list_only')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      pdfPriceMode === 'list_only' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📋 Product List Only
                  </button>
                </div>

                {/* Letterhead Format Controls */}
                {company?.letterheadUrl && (
                  <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
                    <span className="text-[10px] text-slate-400 px-2 font-bold uppercase">Letterhead Format:</span>
                    <button
                      onClick={() => setLetterheadMode('full')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        letterheadMode === 'full' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📜 Full Page Background
                    </button>
                    <button
                      onClick={() => setLetterheadMode('banner')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        letterheadMode === 'banner' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🖼️ Top Header Banner
                    </button>
                    <button
                      onClick={() => setLetterheadMode('blank')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        letterheadMode === 'blank' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📄 Pre-printed Paper
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    href={`/quotations/new?id=${selectedQuote.id}`}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Proposal
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                  </button>
                  <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-200 p-2">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Printable Area Canvas */}
            <div
              className="printable-area bg-white text-slate-900 rounded-2xl shadow-2xl space-y-6 font-sans text-xs select-text"
              style={
                letterheadMode === 'full' && company?.letterheadUrl
                  ? {
                      backgroundImage: `url("${company.letterheadUrl}")`,
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'top center',
                      paddingTop: '135px',
                      paddingBottom: '95px',
                      paddingLeft: '32px',
                      paddingRight: '32px'
                    }
                  : { padding: '32px' }
              }
            >
              {/* LETTERHEAD HEADER MODES */}
              {letterheadMode === 'full' && company?.letterheadUrl ? (
                <div className="border-b border-slate-300 pb-2 flex justify-between items-center text-[11px] font-bold text-slate-700">
                  <span className="font-mono text-amber-800">PROPOSAL #{selectedQuote.quoteNumber}</span>
                  <span>Date: {new Date(selectedQuote.createdAt).toLocaleDateString()}</span>
                </div>
              ) : letterheadMode === 'banner' && company?.letterheadUrl ? (
                <div className="w-full border-b border-slate-200 pb-3">
                  <img src={company.letterheadUrl} alt="Header Banner" className="w-full h-28 object-cover object-top rounded-lg" />
                  <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-500 font-bold">
                    <span className="font-mono text-amber-700">PROPOSAL #{selectedQuote.quoteNumber}</span>
                    <span>Date: {new Date(selectedQuote.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {company?.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}
                    <div>
                      <h1 className="text-2xl font-extrabold text-amber-600">{company?.name || 'Interio Commercial Studio & Turnkey'}</h1>
                      <p className="text-slate-600 font-semibold">{company?.tagline || 'Architectural Commercial Interiors & Office Fitouts'}</p>
                      <p className="text-[11px] text-slate-500">{company?.address || 'Navi Mumbai'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-950 text-amber-400 font-mono font-bold text-xs rounded">
                      {selectedQuote.quoteNumber}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-2">Created Date: {new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">PREPARED FOR CLIENT</p>
                  <p className="text-sm font-bold text-slate-900">{selectedQuote.clientName}</p>
                  <p className="text-slate-600">Phone: {selectedQuote.clientPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">TURNKEY SITE LOCATION</p>
                  <p className="text-xs font-bold text-slate-800">{selectedQuote.siteAddress}</p>
                </div>
              </div>

              {selectedQuote.requirementNotes && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-1">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">📋 Client Requirement Brief & Specifications</p>
                  <p className="text-slate-800 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{selectedQuote.requirementNotes}</p>
                </div>
              )}

              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                    <th className="p-2.5 border-r border-slate-300">ROOM / SPACE</th>
                    <th className="p-2.5 border-r border-slate-300">ITEM & MATERIAL SPECIFICATIONS</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">QTY / MEASURE</th>
                    {pdfPriceMode === 'with_price' && (
                      <>
                        <th className="p-2.5 border-r border-slate-300 text-right">UNIT RATE (₹)</th>
                        <th className="p-2.5 text-right font-bold">LINE TOTAL (₹)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {selectedQuote.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-amber-700">{item.room}</td>
                      <td className="p-2.5 border-r border-slate-200">
                        <p className="font-bold">{item.title}</p>
                        <p className="text-[10px] text-slate-500">{item.description}</p>
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-mono">{item.quantity} {item.unit}</td>
                      {pdfPriceMode === 'with_price' && (
                        <>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono">₹{item.unitRate}</td>
                          <td className="p-2.5 text-right font-bold font-mono">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {pdfPriceMode === 'with_price' && (
                <div className="flex justify-end pt-2">
                  <div className="w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal BOQ:</span>
                      <span className="font-mono">{formatINR(selectedQuote.subtotal)}</span>
                    </div>
                    {selectedQuote.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount Offer:</span>
                        <span className="font-mono">-{formatINR(selectedQuote.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>GST Tax ({selectedQuote.taxRate || 18}%):</span>
                      <span className="font-mono">{formatINR(selectedQuote.taxAmount)}</span>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex justify-between items-center text-sm font-extrabold text-amber-900 pt-2 border-t">
                      <span>FINAL PROJECT PRICE:</span>
                      <span className="font-mono">{formatINR(selectedQuote.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
