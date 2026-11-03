'use client';

import React, { useEffect, useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  CreditCard,
  Building,
  DollarSign,
  Sparkles,
  AlertCircle,
  Calculator,
  Send,
  Copy,
  Check,
  Eye,
  ShieldCheck,
  BookOpen,
  Edit2
} from 'lucide-react';

const INVOICE_TERMS_PRESETS = [
  {
    name: 'Standard 15-Day Terms',
    days: 15,
    notes: 'Terms & Conditions:\n1. Payment due within 15 days of invoice date.\n2. Late payments subject to 1.5% interest per month.\n3. Please share bank transfer UTR receipt upon payment completion.'
  },
  {
    name: 'Immediate Due on Receipt',
    days: 0,
    notes: 'Terms & Conditions:\n1. Payment due immediately upon receipt of invoice.\n2. Site work/material dispatch subject to advance clearance.\n3. Please share transaction screenshot for instant confirmation.'
  },
  {
    name: 'Milestone Material Clearance',
    days: 7,
    notes: 'Terms & Conditions:\n1. Payment due prior to factory dispatch & site delivery.\n2. Work execution resumes upon receipt confirmation.\n3. Bank account details provided below.'
  },
  {
    name: '30-Day Net Corporate Terms',
    days: 30,
    notes: 'Terms & Conditions:\n1. Net 30-day payment terms for corporate accounts.\n2. Invoice billable as per milestone work order completion signoff.'
  }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [letterheadMode, setLetterheadMode] = useState<'full' | 'banner' | 'blank'>('full');

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [reminderInvoice, setReminderInvoice] = useState<any>(null);
  const [reminderText, setReminderText] = useState('');
  const [copiedReminder, setCopiedReminder] = useState(false);

  const [isCustomMilestone, setIsCustomMilestone] = useState(false);
  const [customMilestoneText, setCustomMilestoneText] = useState('');

  const [form, setForm] = useState({
    projectId: '',
    milestoneName: '10% Booking Advance Payment',
    amount: '',
    enableGst: true,
    taxRate: 18,
    issuedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: INVOICE_TERMS_PRESETS[0].notes,
    bankName: 'ICICI Bank Ltd',
    accountNumber: '001105009988',
    ifscCode: 'ICIC0000011',
    branch: 'Nariman Point, Mumbai'
  });

  const [payForm, setPayForm] = useState({
    amountPaid: '',
    paymentMode: 'Bank Transfer',
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

      // Fetch fresh company details
      try {
        const compRes = await fetch('/api/companies');
        const compData = await compRes.json();
        if (Array.isArray(compData) && compData.length > 0) {
          const matched = compId ? compData.find((c: any) => c.id === compId) || compData[0] : compData[0];
          if (matched) setCompany(matched);
        }
      } catch (err) {}

      const invUrl = compId ? `/api/invoices?companyId=${compId}` : '/api/invoices';
      const invRes = await fetch(invUrl);
      const invData = await invRes.json();
      if (Array.isArray(invData)) setInvoices(invData);

      const projUrl = compId ? `/api/projects?companyId=${compId}` : '/api/projects';
      const projRes = await fetch(projUrl);
      const projData = await projRes.json();
      if (Array.isArray(projData)) setProjects(projData);

      const qUrl = compId ? `/api/quotations?companyId=${compId}` : '/api/quotations';
      const qRes = await fetch(qUrl);
      const qData = await qRes.json();
      if (Array.isArray(qData)) setQuotations(qData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyPreset = (preset: typeof INVOICE_TERMS_PRESETS[0]) => {
    const due = new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setForm((prev) => ({
      ...prev,
      dueDate: due,
      notes: preset.notes
    }));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.amount) return;

    const selectedProj = projects.find((p) => p.id === form.projectId);
    if (!selectedProj) return;

    const baseAmount = parseFloat(form.amount) || 0;
    const activeMilestone = isCustomMilestone ? customMilestoneText || 'Custom Milestone' : form.milestoneName;

    // Append Bank details to invoice notes if not present
    let compiledNotes = form.notes;
    if (form.bankName && !compiledNotes.includes('BANK DETAILS:')) {
      compiledNotes += `\n\nBANK DETAILS FOR PAYMENT:\nBank Name: ${form.bankName}\nAccount No: ${form.accountNumber}\nIFSC Code: ${form.ifscCode}\nBranch: ${form.branch}`;
    }

    try {
      const activeCompStr = localStorage.getItem('interio_active_company');
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: compId,
          projectId: form.projectId,
          clientId: selectedProj.clientId,
          clientName: selectedProj.client?.name,
          milestoneName: activeMilestone,
          amount: baseAmount,
          taxAmount: form.enableGst ? baseAmount * (form.taxRate / 100) : 0,
          totalAmount: form.enableGst ? baseAmount * (1 + form.taxRate / 100) : baseAmount,
          status: 'Issued',
          issuedDate: form.issuedDate,
          dueDate: form.dueDate,
          notes: compiledNotes
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setForm({
          projectId: '',
          milestoneName: '10% Booking Advance Payment',
          amount: '',
          enableGst: true,
          taxRate: 18,
          issuedDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: INVOICE_TERMS_PRESETS[0].notes,
          bankName: 'ICICI Bank Ltd',
          accountNumber: '001105009988',
          ifscCode: 'ICIC0000011',
          branch: 'Nariman Point, Mumbai'
        });
        setIsCustomMilestone(false);
        setCustomMilestoneText('');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedInvoice.id,
          status: 'Paid',
          amountPaid: parseFloat(payForm.amountPaid) || selectedInvoice.totalAmount || selectedInvoice.amount,
          paymentMode: payForm.paymentMode,
          transactionRef: payForm.transactionRef || `TXN-${Date.now().toString().slice(-6)}`
        })
      });

      if (res.ok) {
        const updatedInv = await res.json();
        setShowPayModal(false);

        const pReceipt = updatedInv.payments?.[updatedInv.payments.length - 1] || {
          receiptNumber: `REC-${new Date().getFullYear()}-001`,
          amountPaid: parseFloat(payForm.amountPaid) || selectedInvoice.totalAmount,
          paymentMode: payForm.paymentMode,
          transactionRef: payForm.transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString()
        };

        setSelectedPayment(pReceipt);
        setShowReceiptModal(true);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenReminder = (inv: any) => {
    setReminderInvoice(inv);
    const clientName = inv.client?.name || inv.clientName || 'Valued Client';
    const invNum = inv.invoiceNumber;
    const milestone = inv.milestoneName || 'Milestone Stage';
    const amount = formatINR(inv.totalAmount || inv.amount);
    const due = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'Immediate';
    const compName = company?.name || 'Interio Studio';

    const text = `Dear ${clientName},

This is a gentle payment reminder from ${compName} regarding Invoice #${invNum} for ${amount} (${milestone}).

📅 Due Date: ${due}
💳 Payment Options: Bank Transfer / NEFT / RTGS
🏦 Bank Name: ICICI Bank Ltd
🔢 Account Number: 001105009988
⚡ IFSC Code: ICIC0000011

Kindly share the transaction payment receipt once processed. Thank you!`;

    setReminderText(text);
    setCopiedReminder(false);
    setShowReminderModal(true);
  };

  const handleCopyReminderAndMarkSent = async () => {
    if (!reminderInvoice) return;
    try {
      await navigator.clipboard.writeText(reminderText);
      setCopiedReminder(true);

      await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reminderInvoice.id,
          reminderStatus: 'Reminder Sent',
          reminderMessage: reminderText
        })
      });

      fetchData();
    } catch (e) {
      console.error(e);
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

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.milestoneName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" /> Client Billing & Payment Receipts • Module 8
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Invoices & Payment Receipts</h1>
          <p className="text-xs text-slate-400">
            Issue milestone stage tax invoices with editable templates, bank transfer details & terms.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Issue Milestone Invoice
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice #, client, milestone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'Issued', 'Paid', 'Partial'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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
              <th className="p-4">Invoice #</th>
              <th className="p-4">Client & Project Site</th>
              <th className="p-4">Milestone Stage</th>
              <th className="p-4">Issued Date</th>
              <th className="p-4">Status & Reminder</th>
              <th className="p-4 text-right font-bold text-amber-400">Total Amount</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 font-mono font-bold text-amber-400">{inv.invoiceNumber}</td>
                <td className="p-4">
                  <div className="font-bold text-slate-100">{inv.client?.name || inv.clientName}</div>
                  <div className="text-[10px] text-slate-400">{inv.project?.title}</div>
                </td>
                <td className="p-4 font-bold text-slate-300">{inv.milestoneName}</td>
                <td className="p-4 font-mono text-slate-400">{new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}</td>
                <td className="p-4 space-y-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {inv.status}
                  </span>
                  {inv.reminderStatus === 'Reminder Sent' && (
                    <div className="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                      <Send className="w-3 h-3" /> Reminder Sent
                    </div>
                  )}
                </td>
                <td className="p-4 text-right font-bold text-slate-100 text-sm">{formatINR(inv.totalAmount || inv.amount)}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setShowPrintModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" /> View & Print Invoice PDF
                  </button>

                  {inv.status !== 'Paid' && (
                    <>
                      <button
                        onClick={() => handleOpenReminder(inv)}
                        className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs rounded-xl inline-flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Payment Reminder
                      </button>

                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setPayForm({
                            amountPaid: (inv.totalAmount || inv.amount).toString(),
                            paymentMode: 'Bank Transfer',
                            transactionRef: ''
                          });
                          setShowPayModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Receive Payment
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW & PRINT TAX INVOICE PDF MODAL */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex flex-col space-y-3 border-b border-slate-800 pb-4 no-print">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Tax Invoice Document Studio</h3>
                  <p className="text-xs text-slate-400">Invoice #{selectedInvoice.invoiceNumber}</p>
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
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                  </button>
                  <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-200 p-2 font-bold">
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
                  <span className="font-mono text-amber-800">TAX INVOICE #{selectedInvoice.invoiceNumber}</span>
                  <span>Issued Date: {new Date(selectedInvoice.issuedDate || selectedInvoice.createdAt).toLocaleDateString()}</span>
                </div>
              ) : letterheadMode === 'banner' && company?.letterheadUrl ? (
                <div className="w-full border-b border-slate-200 pb-3">
                  <img src={company.letterheadUrl} alt="Header Banner" className="w-full h-28 object-cover object-top rounded-lg" />
                  <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-500 font-bold">
                    <span className="font-mono text-amber-700">TAX INVOICE #{selectedInvoice.invoiceNumber}</span>
                    <span>Issued Date: {new Date(selectedInvoice.issuedDate || selectedInvoice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {company?.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}
                    <div>
                      <h1 className="text-2xl font-extrabold text-amber-600">{company?.name || 'Interio Commercial Studio & Turnkey'}</h1>
                      <p className="text-slate-600 font-semibold">TAX INVOICE / BILL OF SUPPLY</p>
                      <p className="text-[11px] text-slate-500">{company?.address || 'Navi Mumbai'} • GSTIN: {company?.gstin || '27AAACR1234F1Z5'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-950 text-amber-400 font-mono font-bold text-xs rounded">
                      {selectedInvoice.invoiceNumber}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-2">Issued Date: {new Date(selectedInvoice.issuedDate || selectedInvoice.createdAt).toLocaleDateString()}</p>
                    <p className="text-[11px] text-slate-500">Due Date: {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'Immediate'}</p>
                  </div>
                </div>
              )}

              {/* Client & Project Details Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">BILLED TO CLIENT:</p>
                  <p className="text-sm font-bold text-slate-900">{selectedInvoice.client?.name || selectedInvoice.clientName}</p>
                  <p className="text-slate-600">Phone: {selectedInvoice.client?.phone || 'N/A'}</p>
                  <p className="text-slate-600">Email: {selectedInvoice.client?.email || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">FITOUT PROJECT & SITE LOCATION:</p>
                  <p className="text-xs font-bold text-slate-800">{selectedInvoice.project?.title || 'Turnkey Interior Project'}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{selectedInvoice.project?.siteAddress || 'Site Address TBD'}</p>
                </div>
              </div>

              {/* Invoice Breakdown Table */}
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px]">
                    <th className="p-3 border-r border-slate-300">MILESTONE STAGE DESCRIPTION</th>
                    <th className="p-3 border-r border-slate-300 text-right">BASE AMOUNT (₹)</th>
                    <th className="p-3 border-r border-slate-300 text-right">GST TAX (18%)</th>
                    <th className="p-3 text-right font-bold">TOTAL AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-3 border-r border-slate-200">
                      <p className="font-bold text-slate-900">{selectedInvoice.milestoneName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">As per approved project work breakdown structure & terms.</p>
                    </td>
                    <td className="p-3 border-r border-slate-200 text-right font-mono">₹{selectedInvoice.amount?.toLocaleString('en-IN')}</td>
                    <td className="p-3 border-r border-slate-200 text-right font-mono">₹{(selectedInvoice.taxAmount || 0)?.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold font-mono text-amber-700">₹{(selectedInvoice.totalAmount || selectedInvoice.amount)?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Summary Box & Notes/Terms */}
              <div className="grid grid-cols-2 gap-4 items-start pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-[11px]">
                  <p className="font-bold text-slate-800 uppercase border-b border-slate-200 pb-1">TERMS, CONDITIONS & BANK DETAILS:</p>
                  <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                    {selectedInvoice.notes || 'Payment due as per invoice terms.'}
                  </p>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Milestone Subtotal:</span>
                    <span className="font-mono font-bold">₹{selectedInvoice.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span className="font-mono font-bold">₹{(selectedInvoice.taxAmount || 0)?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex justify-between items-center text-sm font-extrabold text-amber-900 mt-2">
                    <span>GRAND TOTAL DUE:</span>
                    <span className="font-mono">{formatINR(selectedInvoice.totalAmount || selectedInvoice.amount)}</span>
                  </div>

                  <div className="pt-2 text-center">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                      selectedInvoice.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      STATUS: {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL WITH TEMPLATE DESIGN & EDITABLE TERMS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" /> Issue Milestone Stage Tax Invoice
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            {/* Template Presets Selector */}
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-amber-400 font-bold block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Select Invoice Terms Preset Template:
              </span>
              <div className="flex flex-wrap gap-2">
                {INVOICE_TERMS_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    ⚡ {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Fitout Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium"
                >
                  <option value="">-- Choose Active Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} - {p.title} (Client: {p.client?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Milestone Stage Description *</label>
                <select
                  value={isCustomMilestone ? 'CUSTOM' : form.milestoneName}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCustomMilestone(true);
                    } else {
                      setIsCustomMilestone(false);
                      setForm({ ...form, milestoneName: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                >
                  <optgroup label="📋 Standard Fitout Billing Stages">
                    <option value="10% Booking Advance Payment">10% Booking Advance Payment</option>
                    <option value="40% Site Demolition & POP Ceiling Stage">40% Site Demolition & POP Ceiling Stage</option>
                    <option value="40% Modular Box & Carcass Production Stage">40% Modular Box & Carcass Production Stage</option>
                    <option value="10% Final Polish & Handover Stage">10% Final Polish & Handover Stage</option>
                  </optgroup>
                  <option value="CUSTOM">✏️ Type Custom Stage Description...</option>
                </select>

                {isCustomMilestone && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom milestone stage description..."
                    value={customMilestoneText}
                    onChange={(e) => setCustomMilestoneText(e.target.value)}
                    className="w-full mt-2 bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-slate-100 font-bold"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Milestone Base Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Editable Bank Transfer Details */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block">Bank Transfer Account Details (Editable):</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Branch Name"
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>

              {/* Editable Terms & Conditions / Notes */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Invoice Terms & Conditions / Instructions (Editable)</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Specify payment instructions, due dates, late fees..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Issue Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT REMINDER MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" /> Payment Reminder Generator
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Copy this pre-formatted reminder text and send manually via WhatsApp / Email to{' '}
                <strong className="text-amber-400">{reminderInvoice?.client?.name || 'Client'}</strong>.
              </p>

              <textarea
                readOnly
                rows={10}
                value={reminderText}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleCopyReminderAndMarkSent}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    copiedReminder
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                  }`}
                >
                  {copiedReminder ? (
                    <>
                      <Check className="w-4 h-4" /> Message Copied & Status Updated to "Reminder Sent"!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Reminder Text & Mark Status Sent
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIVE PAYMENT MODAL */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Record Client Payment Receipt
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 font-semibold">Invoice: #{selectedInvoice.invoiceNumber}</p>
                <p className="text-slate-200 font-bold">Client: {selectedInvoice.client?.name}</p>
                <p className="text-emerald-400 font-mono font-bold text-sm">
                  Invoice Amount: {formatINR(selectedInvoice.totalAmount || selectedInvoice.amount)}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Received Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={payForm.amountPaid}
                  onChange={(e) => setPayForm({ ...payForm, amountPaid: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Payment Mode</label>
                <select
                  value={payForm.paymentMode}
                  onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT / RTGS</option>
                  <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Transaction Ref / UTR #</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-9988112233"
                  value={payForm.transactionRef}
                  onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/20"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
