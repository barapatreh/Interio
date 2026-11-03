'use client';

import React, { useEffect, useState } from 'react';
import {
  Palette,
  Plus,
  Search,
  FileText,
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Download,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  FileCode,
  Filter,
  File,
  MessageSquare,
  Send
} from 'lucide-react';

export default function DesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Source mode: 'file' | 'url'
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  // Form State
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    type: '3D Render Image', // '3D Render Image' | '2D CAD Drawing PDF' | 'Specification Document' | 'External CAD Web URL'
    fileUrl: '',
    fileName: '',
    version: 'v1.0'
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

      const dRes = await fetch(compId ? `/api/designs?companyId=${compId}` : '/api/designs');
      const dData = await dRes.json();
      if (Array.isArray(dData)) setDesigns(dData);

      const pRes = await fetch(compId ? `/api/projects?companyId=${compId}` : '/api/projects');
      const pData = await pRes.json();
      if (Array.isArray(pData)) {
        setProjects(pData);
        if (pData.length > 0 && !form.projectId) {
          setForm((prev) => ({ ...prev, projectId: pData[0].id }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compress image client-side to keep under 150KB for fast Vercel upload
  const compressImage = (file: File, callback: (compressedDataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!file.type.startsWith('image/')) {
        callback(dataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          callback(compressed);
        } else {
          callback(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle local File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType = '3D Render Image';
    if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
      detectedType = '2D CAD Drawing PDF';
    } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      detectedType = 'Specification Document';
    } else if (file.type.startsWith('image/')) {
      detectedType = '3D Render Image';
    }

    compressImage(file, (processedDataUrl) => {
      setForm((prev) => ({
        ...prev,
        fileUrl: processedDataUrl,
        fileName: file.name,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        type: detectedType
      }));
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetProjectId = form.projectId || projects[0]?.id;

    if (!targetProjectId) {
      alert('Please select an active fitout project first');
      return;
    }

    if (!form.title || !form.fileUrl) {
      alert('Please fill out all required fields and upload a file or enter a URL');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          projectId: targetProjectId
        })
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok) {
        alert('Design asset registered successfully!');
        setShowUploadModal(false);
        setForm({
          projectId: projects[0]?.id || '',
          title: '',
          type: '3D Render Image',
          fileUrl: '',
          fileName: '',
          version: 'v1.0'
        });
        fetchData();
      } else {
        alert(data.error || 'Failed to upload design asset');
      }
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      alert('Error uploading design asset');
    }
  };

  const filteredDesigns = designs.filter((d) => {
    if (activeFilter === '3D') return d.type.includes('3D') || d.type.includes('Render') || d.type.includes('Image');
    if (activeFilter === 'PDF') return d.type.includes('PDF') || d.fileUrl.endsWith('.pdf');
    if (activeFilter === 'DOC') return d.type.includes('Doc') || d.type.includes('Spec');
    if (activeFilter === 'URL') return d.type.includes('URL') || d.fileUrl.startsWith('http');
    return true;
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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">3D Renders & CAD Drawings</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Module 5
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload local files (Images, PDFs, Word Docs) or register external web/cloud CAD links for real-time client approval.
          </p>
        </div>

        <button
          onClick={() => {
            if (projects.length > 0 && !form.projectId) {
              setForm((prev) => ({ ...prev, projectId: projects[0].id }));
            }
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <Upload className="w-4 h-4" /> Upload Asset (Image, PDF, Doc, URL)
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Assets ({designs.length})
        </button>
        <button
          onClick={() => setActiveFilter('3D')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === '3D' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🖼️ 3D Render Images
        </button>
        <button
          onClick={() => setActiveFilter('PDF')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'PDF' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          📄 2D CAD PDF Drawings
        </button>
        <button
          onClick={() => setActiveFilter('DOC')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'DOC' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          📝 Spec Documents (DOC/DOCX)
        </button>
        <button
          onClick={() => setActiveFilter('URL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'URL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          🌐 External CAD URLs
        </button>
      </div>

      {/* ASSETS GRID */}
      {filteredDesigns.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <Palette className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Design Assets Registered</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click below to upload a 3D render image, CAD blueprint PDF, or specification document for your fitout projects.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <Upload className="w-4 h-4" /> Register First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => {
            const isPdf = design.type?.includes('PDF') || design.fileUrl?.endsWith('.pdf');
            const isDoc = design.type?.includes('Doc') || design.type?.includes('Spec') || design.fileUrl?.endsWith('.doc') || design.fileUrl?.endsWith('.docx');
            const isUrl = design.type?.includes('URL');

            return (
              <div key={design.id} className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Visual Asset Preview Box */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 flex items-center justify-center group">
                    {!isPdf && !isDoc && !isUrl ? (
                      <img
                        src={design.fileUrl}
                        alt={design.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : isPdf ? (
                      <div className="p-6 text-center space-y-2">
                        <FileText className="w-12 h-12 text-amber-400 mx-auto" />
                        <span className="text-xs font-mono text-slate-300 block">2D Architectural CAD PDF</span>
                      </div>
                    ) : isDoc ? (
                      <div className="p-6 text-center space-y-2">
                        <FileCode className="w-12 h-12 text-blue-400 mx-auto" />
                        <span className="text-xs font-mono text-slate-300 block">Specification Sheet (DOC/DOCX)</span>
                      </div>
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <LinkIcon className="w-12 h-12 text-purple-400 mx-auto" />
                        <span className="text-xs font-mono text-slate-300 block">External CAD / Cloud Link</span>
                      </div>
                    )}

                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {design.type}
                    </span>

                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded text-[10px] font-bold text-slate-300 border border-slate-800">
                      {design.version}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-100">{design.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Project: <span className="font-semibold text-slate-200">{design.project?.title || 'Fitout Project'}</span></p>

                    {/* Client Feedback Note Display */}
                    {design.clientFeedback && (
                      <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 mt-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Client Note: {design.clientFeedback}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge & Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    design.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    design.approvalStatus === 'Disapproved' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {design.approvalStatus === 'Approved' ? '✓ Approved by Client' :
                     design.approvalStatus === 'Disapproved' ? '✕ Disapproved by Client' :
                     '⏳ Pending Signoff'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const text = `🖼️ *INTERIOR DESIGN ASSET / 3D RENDER*\nTitle: ${design.title}\nType: ${design.type}\nProject: ${design.project?.title || 'Fitout Project'}\nVersion: ${design.version}\n\nView Asset Online: ${window.location.origin}/client-portal`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> WhatsApp
                    </button>

                    <a
                      href={design.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={isPdf || isDoc ? design.title : undefined}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open / Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD ASSET MODAL WITH LOCAL FILE & URL SELECTION */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Upload / Register Design Asset</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            {/* SOURCE TOGGLE BUTTONS */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  uploadMode === 'file' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload Local File (Image, PDF, Doc)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  uploadMode === 'url' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-4 h-4" /> Enter Web / Cloud URL
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Active Project *</label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
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
                <label className="block text-slate-300 mb-1 font-medium">Asset Category / Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-semibold"
                >
                  <option value="3D Render Image">🖼️ 3D Render Image (JPG / PNG / WEBP)</option>
                  <option value="2D CAD Drawing PDF">📄 2D CAD Blueprint PDF</option>
                  <option value="Specification Document">📝 Material Spec Sheet (DOC / DOCX)</option>
                  <option value="External CAD Web URL">🌐 External CAD / 360 Panorama URL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Asset Title / Room Description *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Master Bedroom 3D View or Kitchen Plumbing Blueprint"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              {/* INPUT OPTION 1: LOCAL FILE UPLOAD */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Choose Local File (Image, PDF, DOC, DOCX) *</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/60 rounded-xl p-4 text-center cursor-pointer relative transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <File className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-200 text-xs">
                      {form.fileName ? `Selected: ${form.fileName}` : 'Click or Drag & Drop File Here'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WEBP, PDF, DOC, and DOCX files</p>
                  </div>
                </div>
              ) : (
                /* INPUT OPTION 2: EXTERNAL URL */
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">File / Cloud Document URL *</label>
                  <input
                    type="text"
                    required
                    value={form.fileUrl}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value, fileName: 'Web Link' })}
                    placeholder="Paste URL (e.g. https://drive.google.com/... or https://domain.com/drawing.pdf)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Revision Version Tag</label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="v1.0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Uploading Asset...
                    </>
                  ) : (
                    'Save & Register Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
