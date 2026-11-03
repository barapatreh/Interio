'use client';

import React, { useEffect, useState } from 'react';
import {
  Printer,
  Sparkles,
  FileText,
  Receipt,
  CheckCircle,
  Building,
  DollarSign,
  Download,
  Eye,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export default function TemplatesPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [docType, setDocType] = useState<'quotation' | 'invoice'>('quotation');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState(false);

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

      const qRes = await fetch(compId ? `/api/quotations?companyId=${compId}` : '/api/quotations');
      const qData = await qRes.json();
      if (Array.isArray(qData)) {
        setQuotations(qData);
        if (qData.length > 0) setSelectedDocId(qData[0].id);
      }

      const invRes = await fetch(compId ? `/api/invoices?companyId=${compId}` : '/api/invoices');
      const invData = await invRes.json();
      if (Array.isArray(invData)) setInvoices(invData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const activeDoc =
    docType === 'quotation'
      ? quotations.find((q) => q.id === selectedDocId) || quotations[0]
      : invoices.find((i) => i.id === selectedDocId) || invoices[0];

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
            <Sparkles className="w-4 h-4" /> PDF Branding Studio • Module 12
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Document Export PDF Templates</h1>
          <p className="text-xs text-slate-400">
            Select predefined template designs to print or save professional PDF proposals and tax invoices.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">1. Select Document Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDocType('quotation');
                  if (quotations.length > 0) setSelectedDocId(quotations[0].id);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                  docType === 'quotation'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" /> Quotation Proposal
              </button>
              <button
                onClick={() => {
                  setDocType('invoice');
                  if (invoices.length > 0) setSelectedDocId(invoices[0].id);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                  docType === 'invoice'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Receipt className="w-4 h-4" /> Tax Invoice
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">2. Select Document Record</label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium"
            >
              {docType === 'quotation'
                ? quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quoteNumber} - {q.clientName} ({formatINR(q.grandTotal)})
                    </option>
                  ))
                : invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} ({formatINR(inv.totalAmount || inv.amount)})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">3. Actions</label>
            <button
              disabled={!activeDoc}
              onClick={() => setShowPrintModal(true)}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" /> Preview & Print PDF Document
            </button>
          </div>
        </div>
      </div>

      {/* 3 PREDEFINED PDF TEMPLATES LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TEMPLATE 1: LUXURY GOLD */}
        <div
          onClick={() => setSelectedTemplate(1)}
          className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all space-y-4 ${
            selectedTemplate === 1 ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-[11px] rounded-lg border border-amber-500/40">
              Template 1
            </span>
            {selectedTemplate === 1 && <CheckCircle className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Luxury Commercial Turnkey Edition</h3>
            <p className="text-xs text-slate-400">
              Matches client proposals with high-contrast amber header, BOQ item specifications table, and bank transfer card.
            </p>
          </div>
        </div>

        {/* TEMPLATE 2: EXECUTIVE MINIMAL */}
        <div
          onClick={() => setSelectedTemplate(2)}
          className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all space-y-4 ${
            selectedTemplate === 2 ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold text-[11px] rounded-lg border border-slate-700">
              Template 2
            </span>
            {selectedTemplate === 2 && <CheckCircle className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Executive Corporate Minimal</h3>
            <p className="text-xs text-slate-400">
              Clean monochrome corporate aesthetic with centered logo, itemized cost matrix, and clean typography.
            </p>
          </div>
        </div>

        {/* TEMPLATE 3: ROYAL ARCHITECTURAL */}
        <div
          onClick={() => setSelectedTemplate(3)}
          className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all space-y-4 ${
            selectedTemplate === 3 ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-amber-900/30 text-amber-300 font-bold text-[11px] rounded-lg border border-amber-700/50">
              Template 3
            </span>
            {selectedTemplate === 3 && <CheckCircle className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Royal Architectural Grid</h3>
            <p className="text-xs text-slate-400">
              Double-line serif border framing, luxury studio crest branding, and formal manager signoff section.
            </p>
          </div>
        </div>
      </div>

      {/* PRINT MODAL WITH EXACT TEMPLATE MATCH */}
      {showPrintModal && activeDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-4xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-6 max-h-[95vh] overflow-y-auto">
            {/* Top Toolbar (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 no-print">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Extract PDF - Template {selectedTemplate}</h3>
                <p className="text-xs text-slate-400">Ready to print or save as PDF</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
                <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-200 p-2">
                  ✕
                </button>
              </div>
            </div>

            {/* PRINTABLE CANVAS MATCHING SCREENSHOT 1:1 */}
            <div className="printable-area bg-white text-slate-900 p-8 rounded-2xl shadow-2xl space-y-6 font-sans text-xs select-text">
              {/* HEADER SECTION WITH BRANDING */}
              <div className="flex justify-between items-start border-b-2 border-amber-500 pb-4">
                <div className="flex items-center gap-4">
                  {company?.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}
                  <div>
                    <h1 className="text-2xl font-extrabold text-amber-600 tracking-wider">
                      {company?.name || 'Interio Commercial Studio & Turnkey'}
                    </h1>
                    <p className="text-slate-600 font-semibold">{company?.tagline || 'Architectural Commercial Interiors & Office Fitouts'}</p>
                    <p className="text-[11px] text-slate-500">{company?.address || 'Floor 12, Tower 3, Mindspace IT Park, Airoli, Navi Mumbai 400708'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-slate-950 text-amber-400 font-mono font-bold text-xs rounded-md shadow">
                    {docType === 'quotation' ? activeDoc.quoteNumber : activeDoc.invoiceNumber}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-2">Created Date: {new Date(activeDoc.createdAt || activeDoc.issuedDate).toLocaleDateString()}</p>
                  <p className="text-[11px] text-slate-500">
                    Valid Till Date: {activeDoc.validUntilDate ? new Date(activeDoc.validUntilDate).toLocaleDateString() : '30 Days'}
                  </p>
                </div>
              </div>

              {/* CLIENT & SITE PROFILE BOX */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PREPARED FOR CLIENT</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{activeDoc.clientName}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Phone: {activeDoc.clientPhone || '998978478'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TURNKEY SITE LOCATION</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{activeDoc.siteAddress || activeDoc.project?.title || 'Mumbai'}</p>
                </div>
              </div>

              {/* ITEM & MATERIAL SPECIFICATIONS TABLE */}
              {docType === 'quotation' && activeDoc.items && (
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-300 uppercase text-[10px] tracking-wider">
                      <th className="p-2.5 border-r border-slate-300">ROOM / SPACE</th>
                      <th className="p-2.5 border-r border-slate-300">ITEM & MATERIAL SPECIFICATIONS</th>
                      <th className="p-2.5 border-r border-slate-300 text-center">QTY</th>
                      <th className="p-2.5 border-r border-slate-300 text-right">UNIT RATE (₹)</th>
                      <th className="p-2.5 text-right font-bold">LINE TOTAL (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {activeDoc.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-2.5 border-r border-slate-200 font-bold text-amber-700">{item.room}</td>
                        <td className="p-2.5 border-r border-slate-200">
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[10px] text-slate-500 leading-tight">{item.description}</p>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-mono text-slate-800">{item.quantity} {item.unit}</td>
                        <td className="p-2.5 border-r border-slate-200 text-right font-mono text-slate-800">₹{item.unitRate}</td>
                        <td className="p-2.5 text-right font-bold font-mono text-slate-900">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* FINANCIAL CALCULATION TOTALS BOX */}
              <div className="flex justify-end pt-2">
                <div className="w-80 space-y-2 text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
                  {docType === 'quotation' && (
                    <>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Subtotal BOQ:</span>
                        <span className="font-mono font-semibold text-slate-900">{formatINR(activeDoc.subtotal)}</span>
                      </div>
                      {activeDoc.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Discount Offer:</span>
                          <span className="font-mono font-semibold">-{formatINR(activeDoc.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>GST Tax Rate (18%):</span>
                        <span className="font-mono font-semibold text-slate-900">{formatINR(activeDoc.taxAmount)}</span>
                      </div>
                    </>
                  )}
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex justify-between items-center text-sm font-extrabold text-amber-900 mt-2">
                    <span>FINAL PROJECT PRICE:</span>
                    <span className="font-mono text-base">{formatINR(activeDoc.grandTotal || activeDoc.totalAmount || activeDoc.amount)}</span>
                  </div>
                </div>
              </div>

              {/* FIRM BANK TRANSFER ACCOUNT DETAILS BOX */}
              <div className="p-4 bg-amber-50/50 border border-amber-300 rounded-xl space-y-2 text-[11px]">
                <p className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  💳 FIRM BANK TRANSFER ACCOUNT DETAILS
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Bank Name:</span>
                    <span className="font-bold">{company?.bankName || 'ICICI Bank Ltd.'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Account Number:</span>
                    <span className="font-bold">{company?.accountNumber || '001105009988'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">IFSC Code:</span>
                    <span className="font-bold">{company?.ifscCode || 'ICIC0000011'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Branch:</span>
                    <span className="font-bold">{company?.branch || 'Nariman Point, Mumbai'}</span>
                  </div>
                </div>
              </div>

              {/* PROPOSAL TERMS & CONDITIONS */}
              <div className="pt-2 text-[10px] text-slate-600 space-y-1">
                <p className="font-bold uppercase text-slate-800 tracking-wider">PROPOSAL TERMS & CONDITIONS:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>10% Booking Advance</li>
                  <li>40% on Design Signoff & Factory Production</li>
                  <li>40% on Site Material Delivery</li>
                  <li>10% on Final Handover & Snag Clearance</li>
                  <li>Proposal valid for 30 days.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
