'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle,
  Filter,
  Layers,
  Sparkles,
  ListPlus,
  Package
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  '2BHK / 3BHK Combinations',
  'Modular Kitchen',
  'Wardrobes',
  'False Ceiling',
  'Electrical',
  'Painting',
  'Civil',
  'Plumbing',
  'Decor',
  'HVAC & Air Conditioning',
  'Carpentry & Joinery',
  'Glass & Mirror Works',
  'Flooring & Tiling'
];

export default function CataloguePage() {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Trade Category and Package Bundle States
  const [isBundle, setIsBundle] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    category: 'Modular Kitchen',
    title: '',
    description: '',
    unit: 'sq.ft',
    defaultPrice: '',
    status: 'Active'
  });

  // Package Sub-Items State for Combinations / Bundled Services
  const [packageSubItems, setPackageSubItems] = useState<any[]>([]);
  const [selectedCataloguePick, setSelectedCataloguePick] = useState('');

  const availableCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...catalogue.map((item) => item.category).filter(Boolean)
    ])
  ).sort();

  const fetchCatalogue = async () => {
    try {
      const res = await fetch('/api/catalogue');
      const data = await res.json();
      if (Array.isArray(data)) setCatalogue(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const resetForm = () => {
    setFormData({
      category: 'Modular Kitchen',
      title: '',
      description: '',
      unit: 'sq.ft',
      defaultPrice: '',
      status: 'Active'
    });
    setPackageSubItems([]);
    setSelectedCataloguePick('');
    setIsBundle(false);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setEditingItem(null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeCompStr = typeof window !== 'undefined' ? localStorage.getItem('interio_active_company') : null;
      let compId = '';
      if (activeCompStr) {
        try {
          const comp = JSON.parse(activeCompStr);
          if (comp?.id) compId = comp.id;
        } catch (e) {}
      }

      const finalCategory = isCustomCategory ? (customCategoryInput.trim() || 'General Trade') : formData.category;
      const isCombination = isBundle || finalCategory === '2BHK / 3BHK Combinations' || packageSubItems.length > 0;
      const payload = {
        ...formData,
        category: finalCategory,
        ...(compId ? { companyId: compId } : {}),
        unit: isCombination ? 'package' : formData.unit,
        packageItems: isCombination ? packageSubItems : null
      };

      const res = await fetch('/api/catalogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchCatalogue();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    let parsedItems = [];
    if (Array.isArray(item.packageItems)) {
      parsedItems = item.packageItems;
    } else if (typeof item.packageItems === 'string') {
      try {
        parsedItems = JSON.parse(item.packageItems);
      } catch (e) {}
    }

    const isPackageBundle = item.category === '2BHK / 3BHK Combinations' || parsedItems.length > 0;
    setIsBundle(isPackageBundle);
    setPackageSubItems(parsedItems);

    const isCustomCat = item.category && !DEFAULT_CATEGORIES.includes(item.category);
    setIsCustomCategory(isCustomCat);
    if (isCustomCat) {
      setCustomCategoryInput(item.category);
    }

    setFormData({
      category: item.category || 'Modular Kitchen',
      title: item.title || '',
      description: item.description || '',
      unit: item.unit || 'sq.ft',
      defaultPrice: item.defaultPrice !== undefined ? String(item.defaultPrice) : '',
      status: item.status || 'Active'
    });
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const finalCategory = isCustomCategory ? (customCategoryInput.trim() || 'General Trade') : formData.category;
      const isCombination = isBundle || finalCategory === '2BHK / 3BHK Combinations' || packageSubItems.length > 0;
      const payload = {
        ...formData,
        category: finalCategory,
        unit: isCombination ? 'package' : formData.unit,
        packageItems: isCombination ? packageSubItems : null
      };

      const res = await fetch(`/api/catalogue/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEditingItem(null);
        resetForm();
        fetchCatalogue();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalogue item?')) return;
    try {
      const res = await fetch(`/api/catalogue/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCatalogue();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePickServiceFromCatalogue = (serviceId: string) => {
    if (!serviceId) return;
    const item = catalogue.find((c) => c.id === serviceId);
    if (!item) return;

    setPackageSubItems((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: item.category || 'General',
        title: item.title || '',
        description: item.description || '',
        unit: item.unit || 'sq.ft',
        defaultPrice: item.defaultPrice || 0
      }
    ]);
    setSelectedCataloguePick('');
  };

  const handleAddBlankSubItem = () => {
    setPackageSubItems((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        category: 'General',
        title: '',
        description: '',
        unit: 'sq.ft',
        defaultPrice: 0
      }
    ]);
  };

  const handleRemoveSubItem = (idx: number) => {
    setPackageSubItems(packageSubItems.filter((_, i) => i !== idx));
  };

  const filteredItems = catalogue.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const subItemsTotalRate = packageSubItems.reduce((acc, curr) => acc + (Number(curr.defaultPrice) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" /> Service Catalogue Studio
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Service & Pricing Master Catalogue</h1>
          <p className="text-xs text-slate-400">
            Manage, edit & add standard interior service specifications, default rates, and 2BHK/3BHK custom service packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              resetForm();
              setFormData({
                category: 'Modular Kitchen',
                title: '',
                description: '',
                unit: 'sq.ft',
                defaultPrice: '',
                status: 'Active'
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" /> + Add Service Item
          </button>

          <button
            onClick={() => {
              resetForm();
              setFormData({
                category: '2BHK / 3BHK Combinations',
                title: '',
                description: '',
                unit: 'package',
                defaultPrice: '',
                status: 'Active'
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Package className="w-4 h-4" /> + Create Custom Service Plan
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalogue items or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {['All Categories', ...availableCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4">Trade Category</th>
              <th className="p-4">Item Title & Material Specs</th>
              <th className="p-4">Measuring Unit</th>
              <th className="p-4 font-bold text-amber-400">Default Rate (INR)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredItems.map((item) => {
              const isCombination =
                item.category === '2BHK / 3BHK Combinations' ||
                (Array.isArray(item.packageItems) && item.packageItems.length > 0);
              const subItems = Array.isArray(item.packageItems) ? item.packageItems : [];

              return (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 w-fit ${
                        isCombination
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {isCombination && <Package className="w-3 h-3 text-amber-400" />}
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      {item.title}
                      {isCombination && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
                          {subItems.length} Bundled Services
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</div>
                    )}

                    {/* Display bundled services if Combination package */}
                    {isCombination && subItems.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/20">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                          Included Package Sub-Services:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                          {subItems.map((sub: any, sIdx: number) => (
                            <div key={sIdx} className="text-slate-300 flex items-center gap-1">
                              <span className="text-amber-400">•</span>
                              <span className="font-semibold">{sub.title || 'Untitled Service'}</span>
                              {sub.category && <span className="text-slate-500">({sub.category})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-300">per {item.unit || 'unit'}</td>
                  <td className="p-4 font-bold text-amber-400 text-sm">{formatINR(item.defaultPrice)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}
                    >
                      {item.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition-colors"
                      title="Edit Item / Package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                  No catalogue items or packages found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Item Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-amber-500/30 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {editingItem ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                {editingItem ? 'Edit Service Item / Plan' : formData.category === '2BHK / 3BHK Combinations' ? 'Create Custom Service Plan (2BHK / 3BHK)' : 'Add Single Service Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Trade Category *</label>
                  <select
                    value={isCustomCategory ? 'CUSTOM' : formData.category}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomCategory(true);
                        setCustomCategoryInput('');
                      } else {
                        setIsCustomCategory(false);
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Create New Trade Category...</option>
                  </select>

                  {isCustomCategory && (
                    <div className="mt-2 space-y-1">
                      <label className="block text-[10px] text-amber-400 font-bold">New Custom Trade Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HVAC, Glasswork, Carpentry..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-500 rounded-xl px-3 py-1.5 text-amber-300 font-bold text-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Measuring Unit *</label>
                  <select
                    value={isBundle || formData.category === '2BHK / 3BHK Combinations' ? 'package' : formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={isBundle || formData.category === '2BHK / 3BHK Combinations'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="sq.ft">per sq.ft</option>
                    <option value="r.ft">per r.ft</option>
                    <option value="sq.m">per sq.m</option>
                    <option value="unit">per unit</option>
                    <option value="lump sum">lump sum</option>
                    <option value="package">per package</option>
                    <option value="point">per point</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {isBundle || formData.category === '2BHK / 3BHK Combinations' ? 'Service Plan / Package Title *' : 'Item Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isBundle || formData.category === '2BHK / 3BHK Combinations'
                      ? 'e.g. 3BHK Turnkey Interior Plan / Kitchen & Wardrobe Package'
                      : 'e.g. Quartz Countertop 15mm'
                  }
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* SERVICE BUNDLE TOGGLE */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">Bundle Multiple Service Items into a Plan / Collection</span>
                    <span className="text-[10px] text-slate-400">Combine modular kitchen, wardrobes, ceiling, civil etc. into a single package.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="bundleCheckbox"
                  checked={isBundle || formData.category === '2BHK / 3BHK Combinations' || packageSubItems.length > 0}
                  onChange={(e) => setIsBundle(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Default Package / Unit Rate (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1250000"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  {packageSubItems.length > 0 && subItemsTotalRate > 0 && (
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Sum of sub-services: <strong className="text-amber-300">{formatINR(subItemsTotalRate)}</strong></span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, defaultPrice: String(subItemsTotalRate) })}
                        className="text-amber-400 hover:underline font-bold"
                      >
                        Use Sum
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Material Specifications & Overview</label>
                <textarea
                  rows={2}
                  placeholder="Comprehensive service plan brief and material specifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* BUNDLED PACKAGE SERVICES EDITOR */}
              {(isBundle || formData.category === '2BHK / 3BHK Combinations' || packageSubItems.length > 0) && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <Layers className="w-3.5 h-3.5 text-amber-400" /> Bundled Services in Plan ({packageSubItems.length})
                    </span>

                    <button
                      type="button"
                      onClick={handleAddBlankSubItem}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Blank Service
                    </button>
                  </div>

                  {/* Pick Existing Service Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-[10px] font-medium">
                      Select Service from Master Catalogue to Bundle into Plan:
                    </label>
                    <select
                      value={selectedCataloguePick}
                      onChange={(e) => {
                        setSelectedCataloguePick(e.target.value);
                        handlePickServiceFromCatalogue(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-amber-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Pick & Add Existing Service (Modular Kitchen, Wardrobe, TV Unit, etc.) --</option>
                      {catalogue
                        .filter((c) => c.category !== '2BHK / 3BHK Combinations')
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            + Add: {item.title} ({item.category}) - {formatINR(item.defaultPrice)}/{item.unit || 'unit'}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Sub items list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {packageSubItems.map((sub, sIdx) => (
                      <div key={sIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <label className="text-[9px] text-slate-500 block mb-0.5 font-medium">Service Title *</label>
                            <input
                              type="text"
                              placeholder="Title (e.g. Modular Kitchen)"
                              value={sub.title}
                              onChange={(e) => {
                                const updated = [...packageSubItems];
                                updated[sIdx].title = e.target.value;
                                setPackageSubItems(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold text-xs"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="text-[9px] text-slate-500 block mb-0.5 font-medium">Category</label>
                            <input
                              type="text"
                              placeholder="Category"
                              value={sub.category}
                              onChange={(e) => {
                                const updated = [...packageSubItems];
                                updated[sIdx].category = e.target.value;
                                setPackageSubItems(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-[10px]"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="text-[9px] text-slate-500 block mb-0.5 font-medium">Default Rate (₹)</label>
                            <input
                              type="number"
                              placeholder="Rate"
                              value={sub.defaultPrice !== undefined ? sub.defaultPrice : ''}
                              onChange={(e) => {
                                const updated = [...packageSubItems];
                                updated[sIdx].defaultPrice = parseFloat(e.target.value) || 0;
                                setPackageSubItems(updated);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-400 font-mono text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-1 text-right pt-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveSubItem(sIdx)}
                              className="text-rose-400 font-bold text-xs hover:bg-rose-500/20 p-1 rounded"
                              title="Remove service from plan"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Material specification or scope brief..."
                            value={sub.description || ''}
                            onChange={(e) => {
                              const updated = [...packageSubItems];
                              updated[sIdx].description = e.target.value;
                              setPackageSubItems(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-400 text-[10px]"
                          />
                        </div>
                      </div>
                    ))}

                    {packageSubItems.length === 0 && (
                      <div className="p-3 text-center text-slate-500 text-[10px] italic">
                        No bundled services added yet. Use dropdown above to select existing catalogue services or click "+ Add Custom Blank Service".
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
                >
                  {editingItem ? 'Save Changes' : 'Save Service / Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

