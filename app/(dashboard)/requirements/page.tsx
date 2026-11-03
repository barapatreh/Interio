'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Notebook,
  UserCheck,
  Plus,
  Sparkles,
  Zap,
  Save,
  FileText,
  CheckCircle,
  Search,
  BookOpen,
  ArrowRight,
  UserPlus,
  Printer,
  Edit3,
  Trash2,
  ListPlus,
  Layers,
  ChevronDown
} from 'lucide-react';

const DEFAULT_CATALOGUE = [
  { id: 'cat-1', category: 'Modular Kitchen', title: 'Acrylic BWP Modular Kitchen', description: 'BWP Marine Ply boxes with 1.5mm High Gloss Acrylic Shutters & Hettich fittings', unit: 'sq.ft', defaultPrice: 1850 },
  { id: 'cat-2', category: 'Modular Kitchen', title: 'L-Shape Laminate Modular Kitchen', description: 'Commercial Ply with 1mm Gloss Laminate & SS Soft Close Baskets', unit: 'sq.ft', defaultPrice: 1450 },
  { id: 'cat-3', category: 'False Ceiling', title: 'Gypsum Board False Ceiling with Cove Light', description: 'Saint Gobain Gypsum Board with magnetic track & LED cove lights', unit: 'sq.ft', defaultPrice: 145 },
  { id: 'cat-4', category: 'Wardrobes', title: 'Full Height Sliding Wardrobe with Lacquered Glass', description: '18mm CenturyPly carcass with lacquered glass sliding doors', unit: 'sq.ft', defaultPrice: 1950 },
  { id: 'cat-5', category: 'Wardrobes', title: 'Hinged Door Wardrobe with Loft Storage', description: '18mm Commercial Ply with suede finish laminate', unit: 'sq.ft', defaultPrice: 1550 },
  { id: 'cat-6', category: 'Civil & Flooring', title: 'Vitrified Tile Flooring Installation', description: '800x800mm Double Charged Vitrified Tiles with tile adhesive laying', unit: 'sq.ft', defaultPrice: 165 },
  { id: 'cat-7', category: 'Electrical', title: 'Complete Concealed Electrical Wiring & Switchboards', description: 'Polycab FR copper wires with modular switches & DB panel', unit: 'point', defaultPrice: 850 },
  { id: 'cat-8', category: 'Painting', title: 'Premium Emulsion Wall Painting with Putty', description: 'Asian Paints Royale Emulsion with 2 coats acrylic putty & primer', unit: 'sq.ft', defaultPrice: 45 },
  { id: 'cat-9', category: 'Plumbing', title: 'Concealed Bathroom Plumbing & CP Fittings', description: 'Astral CPVC/UPVC piping with Jaquar/Kohler CP fittings installation', unit: 'unit', defaultPrice: 18500 },
  { id: 'cat-10', category: 'Decor & Panel', title: 'Fluted Panel TV Unit & Veneer Panel', description: 'Charcoal fluted louvers with HDMR veneer panel and ambient strip light', unit: 'unit', defaultPrice: 65000 }
];

const formatINR = (val: any) => {
  const num = typeof val === 'number' ? val : parseFloat(String(val || 0));
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

const REQUIREMENT_PRESETS = [
  {
    name: '3BHK Luxury Turnkey Fitout',
    notes: 'Client Requirement Brief:\n- Property: 3BHK Apartment (~1350 sq.ft)\n- Modular Kitchen: Acrylic finish BWP Plywood with tandem drawers & Hettich soft-close hinges.\n- Living Room: Saint Gobain Gypsum false ceiling with cove lighting & TV Unit in Louvers & Veneer.\n- Master Bedroom: Full height sliding wardrobe with lacquered glass & king size bed back cushioning.\n- Target Budget: ₹12.5 Lakhs.',
    sampleItems: [
      { id: 'p1-1', category: 'Modular Kitchen', title: 'Acrylic BWP Modular Kitchen', description: 'BWP Marine Ply boxes with 1.5mm High Gloss Acrylic Shutters & Hettich fittings' },
      { id: 'p1-2', category: 'False Ceiling', title: 'Gypsum Board False Ceiling with Cove Light', description: 'Saint Gobain Gypsum Board with magnetic track & LED cove lights' },
      { id: 'p1-3', category: 'Wardrobes', title: 'Full Height Sliding Wardrobe with Lacquered Glass', description: '18mm CenturyPly carcass with lacquered glass sliding doors' },
      { id: 'p1-4', category: 'Decor & Panel', title: 'Fluted Panel TV Unit & Veneer Panel', description: 'Charcoal fluted louvers with HDMR veneer panel and ambient strip light' }
    ]
  },
  {
    name: '2BHK Budget Friendly Fitout',
    notes: 'Client Requirement Brief:\n- Property: 2BHK Apartment (~850 sq.ft)\n- Modular Kitchen: L-Shape Laminate finish with SS basket drawers.\n- Living Room: Perimeter border ceiling with LED spot lights.\n- Master Bedroom: 2-Door Laminate wardrobe with loft storage.\n- Target Budget: ₹6.5 Lakhs.',
    sampleItems: [
      { id: 'p2-1', category: 'Modular Kitchen', title: 'L-Shape Laminate Modular Kitchen', description: 'Commercial Ply with 1mm Gloss Laminate & SS Soft Close Baskets' },
      { id: 'p2-2', category: 'False Ceiling', title: 'Gypsum Board False Ceiling with Cove Light', description: 'Perimeter border ceiling with LED spot lights' },
      { id: 'p2-3', category: 'Wardrobes', title: 'Hinged Door Wardrobe with Loft Storage', description: '18mm Commercial Ply with suede finish laminate' }
    ]
  },
  {
    name: 'Modular Kitchen Special',
    notes: 'Client Requirement Brief:\n- Modular Kitchen Requisition:\n- Parallel Kitchen Layout.\n- Bottom Carcass: Heavy BWP Plywood with Quartz Stone Countertop.\n- Overhead Cabinets: Frosted Glass Aluminium Profile doors with hydraulic lift-ups.',
    sampleItems: [
      { id: 'p3-1', category: 'Modular Kitchen', title: 'Acrylic BWP Modular Kitchen', description: 'Heavy BWP Plywood with Quartz Stone Countertop & Blum hardware' }
    ]
  }
];

function ClientRequirementsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryClientId = searchParams.get('clientId') || '';
  const queryLeadId = searchParams.get('leadId') || '';

  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [catalogueItems, setCatalogueItems] = useState<any[]>(DEFAULT_CATALOGUE);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [letterheadMode, setLetterheadMode] = useState<'full' | 'banner' | 'blank'>('full');

  // Selection mode: 'EXISTING_CLIENT' | 'EXISTING_LEAD' | 'NEW_PERSON'
  const [mode, setMode] = useState<'EXISTING_CLIENT' | 'EXISTING_LEAD' | 'NEW_PERSON'>('EXISTING_CLIENT');
  const [selectedClientId, setSelectedClientId] = useState(queryClientId || queryLeadId);

  // Editable Client Form Fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [propertyType, setPropertyType] = useState('3BHK Apartment');
  const [budget, setBudget] = useState('');

  // Service Catalogue Requirement Selector State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>('');
  const [selectedRequirements, setSelectedRequirements] = useState<any[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [editingRequirement, setEditingRequirement] = useState<any>(null);
  const [activeSelectedPlan, setActiveSelectedPlan] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
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

    try {
      const compRes = await fetch('/api/companies').then((res) => res.json()).catch(() => []);
      if (Array.isArray(compRes) && compRes.length > 0) {
        const matched = compId ? compRes.find((c: any) => c.id === compId) || compRes[0] : compRes[0];
        if (matched) setCompany(matched);
      }

      const [cRes, lRes, catRes] = await Promise.all([
        fetch(compId ? `/api/clients?companyId=${compId}` : '/api/clients').then((res) => res.json()),
        fetch(compId ? `/api/leads?companyId=${compId}` : '/api/leads').then((res) => res.json()),
        fetch(compId ? `/api/catalogue?companyId=${compId}` : '/api/catalogue').then((res) => res.json())
      ]);

      if (Array.isArray(cRes)) setClients(cRes);
      if (Array.isArray(lRes)) setLeads(lRes);

      if (queryLeadId && Array.isArray(lRes)) {
        const targetLead = lRes.find((l: any) => l.id === queryLeadId);
        if (targetLead) {
          setMode('EXISTING_LEAD');
          populateLeadFields(targetLead);
        } else if (Array.isArray(cRes) && cRes.length > 0) {
          populateClientFields(cRes[0]);
        }
      } else if (queryClientId && Array.isArray(cRes)) {
        const targetClient = cRes.find((c: any) => c.id === queryClientId);
        if (targetClient) {
          setMode('EXISTING_CLIENT');
          populateClientFields(targetClient);
        } else if (cRes.length > 0) {
          populateClientFields(cRes[0]);
        }
      } else if (Array.isArray(cRes) && cRes.length > 0) {
        setMode('EXISTING_CLIENT');
        populateClientFields(cRes[0]);
      }

      const dbCatalogue = Array.isArray(catRes) ? catRes : [];
      const combined = [...dbCatalogue];
      DEFAULT_CATALOGUE.forEach((def) => {
        if (!combined.some((c) => c.title?.toLowerCase() === def.title.toLowerCase())) {
          combined.push(def);
        }
      });
      setCatalogueItems(combined);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [queryClientId, queryLeadId]);

  // Extract existing notes into selected requirements (if structured) or additional notes
  const parseNotesField = (rawNotes: string) => {
    if (!rawNotes) {
      setSelectedRequirements([]);
      setAdditionalNotes('');
      return;
    }

    if (rawNotes.includes('--- SELECTED SERVICE CATALOGUE REQUIREMENTS ---')) {
      const parts = rawNotes.split('--- ADDITIONAL NOTES & INSTRUCTIONS ---');
      const cataloguePart = parts[0];
      const extraPart = parts[1] || '';

      const lines = cataloguePart.split('\n').filter((l) => l.trim().startsWith('•') || /^\d+\./.test(l.trim()));
      const parsedReqs = lines.map((line, i) => {
        const clean = line.replace(/^[•\d\.\s]+/, '');
        const catMatch = clean.match(/^\[(.*?)\]\s*(.*)$/);
        if (catMatch) {
          const cat = catMatch[1];
          let rest = catMatch[2];
          let price = undefined;
          let unit = 'unit';

          const priceMatch = rest.match(/\s*\(₹(\d+(?:\.\d+)?)\/([^)]+)\)/);
          if (priceMatch) {
            price = parseFloat(priceMatch[1]);
            unit = priceMatch[2];
            rest = rest.replace(priceMatch[0], '');
          }

          const [title, ...descArr] = rest.split(' - ');
          return {
            id: `parsed-${i}-${Date.now()}`,
            category: cat,
            title: title ? title.trim() : clean,
            description: descArr.join(' - '),
            defaultPrice: price,
            unit
          };
        }
        return {
          id: `parsed-${i}-${Date.now()}`,
          category: 'General',
          title: clean,
          description: ''
        };
      });

      setSelectedRequirements(parsedReqs);
      setAdditionalNotes(extraPart.trim());
    } else {
      setSelectedRequirements([]);
      setAdditionalNotes(rawNotes);
    }
  };

  const populateClientFields = (c: any) => {
    setSelectedClientId(c.id);
    setClientName(c.name || '');
    setClientPhone(c.phone || '');
    setClientEmail(c.email || '');
    setSiteAddress(c.address || c.city || '');
    setPropertyType(c.propertyType || '3BHK Apartment');
    setBudget(c.budget ? String(c.budget) : '');
    parseNotesField(c.notes || '');
    setSavedSuccess(false);
  };

  const populateLeadFields = (l: any) => {
    setSelectedClientId(l.id);
    setClientName(l.name || '');
    setClientPhone(l.phone || '');
    setClientEmail(l.email || '');
    setSiteAddress(l.location || '');
    setPropertyType(l.propertyType || '3BHK Apartment');
    setBudget(l.estimatedBudget ? String(l.estimatedBudget) : '');
    parseNotesField(l.notes || '');
    setSavedSuccess(false);
  };

  const handleStartNewPerson = () => {
    setMode('NEW_PERSON');
    setSelectedClientId('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setSiteAddress('');
    setPropertyType('3BHK Apartment');
    setBudget('');
    setSelectedRequirements([]);
    setAdditionalNotes('');
    setSavedSuccess(false);
  };

  const handleApplyPreset = (preset: typeof REQUIREMENT_PRESETS[0]) => {
    if (preset.sampleItems && preset.sampleItems.length > 0) {
      const newReqs = [...selectedRequirements];
      preset.sampleItems.forEach((item) => {
        if (!newReqs.some((r) => r.title === item.title)) {
          newReqs.push({ ...item, id: `preset-${Date.now()}-${Math.random()}` });
        }
      });
      setSelectedRequirements(newReqs);
    }
    setAdditionalNotes((prev) => (prev ? `${prev}\n\n${preset.notes}` : preset.notes));
  };

  // Add full Service Plan / Combination Package into requirements
  const handleAddServicePlan = (planItem: any) => {
    if (!planItem) return;
    setActiveSelectedPlan(planItem);

    let subItems: any[] = [];
    if (Array.isArray(planItem.packageItems)) {
      subItems = planItem.packageItems;
    } else if (typeof planItem.packageItems === 'string') {
      try {
        subItems = JSON.parse(planItem.packageItems);
      } catch (e) {}
    }

    const newReqs = [...selectedRequirements];

    if (subItems.length > 0) {
      subItems.forEach((sub: any) => {
        newReqs.push({
          id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          category: sub.category || planItem.category || 'Package Service',
          title: sub.title || 'Service Item',
          description: sub.description || '',
          unit: sub.unit || 'unit',
          defaultPrice: sub.defaultPrice !== undefined ? sub.defaultPrice : 0
        });
      });
    } else {
      newReqs.push({
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: planItem.category || 'General',
        title: planItem.title,
        description: planItem.description || '',
        unit: planItem.unit || 'package',
        defaultPrice: planItem.defaultPrice
      });
    }

    setSelectedRequirements(newReqs);
  };

  // Add item or package combination from Service Catalogue dropdown
  const handleAddRequirementFromCatalogue = () => {
    if (!selectedCatalogueId) {
      alert('Please select a service item from the catalogue dropdown');
      return;
    }

    const item = catalogueItems.find((c) => c.id === selectedCatalogueId);
    if (!item) return;

    let subItems: any[] = [];
    if (Array.isArray(item.packageItems)) {
      subItems = item.packageItems;
    } else if (typeof item.packageItems === 'string') {
      try {
        subItems = JSON.parse(item.packageItems);
      } catch (e) {}
    }

    const cat = item.category?.toLowerCase() || '';
    const isCombo = cat.includes('combination') || cat.includes('2bhk') || cat.includes('3bhk') || cat.includes('package');

    if (isCombo || subItems.length > 0) {
      handleAddServicePlan(item);
    } else {
      setSelectedRequirements([
        ...selectedRequirements,
        {
          id: `req-${Date.now()}-${Math.random()}`,
          category: item.category || 'General',
          title: item.title,
          description: item.description || '',
          unit: item.unit || 'unit',
          defaultPrice: item.defaultPrice
        }
      ]);
    }

    setSelectedCatalogueId('');
  };

  const handleRemoveRequirement = (id: string) => {
    setSelectedRequirements(selectedRequirements.filter((r) => r.id !== id));
  };

  const handleSaveEditedRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequirement) return;

    setSelectedRequirements(
      selectedRequirements.map((r) => (r.id === editingRequirement.id ? editingRequirement : r))
    );
    setEditingRequirement(null);
  };

  // Compile full notes string combining Service Catalogue items + Additional Notes
  const compileFullRequirementNotes = () => {
    let text = '';
    if (selectedRequirements.length > 0) {
      text += '--- SELECTED SERVICE CATALOGUE REQUIREMENTS ---\n';
      selectedRequirements.forEach((item) => {
        const priceStr = item.defaultPrice !== undefined && item.defaultPrice !== null ? ` (₹${item.defaultPrice}/${item.unit || 'unit'})` : '';
        text += `• [${item.category}] ${item.title}${priceStr}${item.description ? ` - ${item.description}` : ''}\n`;
      });
    }
    if (additionalNotes.trim()) {
      if (text) text += '\n';
      text += '--- ADDITIONAL NOTES & INSTRUCTIONS ---\n';
      text += additionalNotes.trim();
    }
    return text;
  };

  const handleSaveNotes = async (): Promise<any> => {
    if (!clientName.trim()) {
      alert('Please enter Client / Person Name');
      return null;
    }

    setSaving(true);
    const compiledNotes = compileFullRequirementNotes();

    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = '';
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id) compId = comp.id;
      } catch (e) {}
    }

    try {
      if (mode === 'NEW_PERSON' || !selectedClientId) {
        // Create new Client profile with requirement notes
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: compId,
            name: clientName,
            phone: clientPhone || '9876543210',
            email: clientEmail,
            address: siteAddress,
            city: siteAddress ? siteAddress.split(',')[0] : 'Mumbai',
            propertyType,
            budget: budget ? parseFloat(budget) : undefined,
            notes: compiledNotes
          })
        });

        const newClient = await res.json();
        setSaving(false);
        if (res.ok && newClient?.id) {
          setSelectedClientId(newClient.id);
          setMode('EXISTING_CLIENT');
          setSavedSuccess(true);
          loadData();
          setTimeout(() => setSavedSuccess(false), 3000);
          return { id: newClient.id, isClient: true };
        } else {
          alert(newClient.error || 'Failed to create new client record');
          return null;
        }
      } else if (mode === 'EXISTING_LEAD') {
        // Update existing Lead
        const res = await fetch(`/api/leads/${selectedClientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            location: siteAddress,
            propertyType,
            estimatedBudget: budget ? parseFloat(budget) : undefined,
            notes: compiledNotes
          })
        });

        const updated = await res.json();
        setSaving(false);
        if (res.ok) {
          setSavedSuccess(true);
          loadData();
          setTimeout(() => setSavedSuccess(false), 3000);
          return { id: selectedClientId, isLead: true };
        } else {
          alert(updated.error || 'Failed to update lead requirement notes');
          return null;
        }
      } else {
        // Update existing Client
        const res = await fetch(`/api/clients/${selectedClientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            address: siteAddress,
            propertyType,
            budget: budget ? parseFloat(budget) : undefined,
            notes: compiledNotes
          })
        });

        const updated = await res.json();
        setSaving(false);
        if (res.ok) {
          setSavedSuccess(true);
          loadData();
          setTimeout(() => setSavedSuccess(false), 3000);
          return { id: selectedClientId, isClient: true };
        } else {
          alert(updated.error || 'Failed to update requirement notes');
          return null;
        }
      }
    } catch (error) {
      console.error(error);
      setSaving(false);
      alert('Error saving client requirement notes');
      return null;
    }
  };

  const handleGenerateQuotation = async () => {
    let resultObj = null;
    if (mode === 'NEW_PERSON' || !selectedClientId) {
      resultObj = await handleSaveNotes();
      if (!resultObj?.id) return;
    } else {
      resultObj = await handleSaveNotes();
      if (!resultObj) return;
    }

    const compiledNotes = compileFullRequirementNotes();
    if (mode === 'EXISTING_LEAD' || resultObj?.isLead) {
      router.push(`/quotations/new?leadId=${selectedClientId}&notes=${encodeURIComponent(compiledNotes)}`);
    } else {
      const targetId = resultObj?.id || selectedClientId;
      router.push(`/quotations/new?clientId=${targetId}&notes=${encodeURIComponent(compiledNotes)}`);
    }
  };

  // Service Plans extracted from catalogue
  const servicePlans = catalogueItems.filter((item) => {
    const cat = item.category?.toLowerCase() || '';
    const isCombo = cat.includes('combination') || cat.includes('2bhk') || cat.includes('3bhk') || cat.includes('package');
    let subCount = 0;
    if (Array.isArray(item.packageItems)) {
      subCount = item.packageItems.length;
    } else if (typeof item.packageItems === 'string' && item.packageItems.trim().length > 0) {
      try {
        const parsed = JSON.parse(item.packageItems);
        if (Array.isArray(parsed)) subCount = parsed.length;
      } catch (e) {}
    } else if (typeof item.packageItems === 'object' && item.packageItems !== null) {
      subCount = Object.keys(item.packageItems).length;
    }
    return isCombo || subCount > 0;
  });

  // Categories extracted from catalogue (merging standard categories)
  const STANDARD_CATEGORIES = [
    '2BHK / 3BHK Combinations',
    'Modular Kitchen',
    'Wardrobes',
    'False Ceiling',
    'Electrical',
    'Painting',
    'Civil & Flooring',
    'Plumbing',
    'Decor & Panel'
  ];

  const availableCategories = Array.from(
    new Set([
      ...STANDARD_CATEGORIES,
      ...catalogueItems.map((item) => item.category || 'General')
    ])
  ).filter(Boolean).sort();

  // Filtered catalogue items based on selected category
  const filteredCatalogueOptions = selectedCategory === 'ALL'
    ? catalogueItems
    : catalogueItems.filter((item) => item.category === selectedCategory);

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.propertyType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm) ||
      l.propertyType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Notebook className="w-4 h-4" /> Pre-Quotation Briefing Studio
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">Client Requirement Notepad</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Select services directly from the Service Catalogue dropdown, add specific requirements, and include custom additional notes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Print Brief (PDF)
          </button>

          <button
            onClick={handleGenerateQuotation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <FileText className="w-4 h-4" /> Generate Quotation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Source Selector */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" /> Select Person Source
            </h3>
            <button
              onClick={handleStartNewPerson}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> + New Person
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('EXISTING_CLIENT')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'EXISTING_CLIENT' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              Clients ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => setMode('EXISTING_LEAD')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'EXISTING_LEAD' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              CRM Leads ({leads.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Person List */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {mode === 'EXISTING_CLIENT' &&
              filteredClients.map((c) => {
                const isSelected = selectedClientId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setMode('EXISTING_CLIENT');
                      populateClientFields(c);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-slate-100 shadow-md shadow-amber-500/5'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{c.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">{c.propertyType || 'Client'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.phone} • {c.address || c.city || 'Location TBD'}</p>
                  </button>
                );
              })}

            {mode === 'EXISTING_LEAD' &&
              filteredLeads.map((l) => {
                const isSelected = selectedClientId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setMode('EXISTING_LEAD');
                      populateLeadFields(l);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-slate-100 shadow-md shadow-amber-500/5'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{l.name}</span>
                      <span className="text-[10px] font-mono text-blue-400 font-semibold">{l.status || 'Lead'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{l.phone} • {l.location || 'Location TBD'}</p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right 2 Columns: Editable Client Details & Requirement Notepad Workspace */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          {/* Editable Client Info Header Form */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Edit3 className="w-3.5 h-3.5" /> Client / Person Contact Details
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {mode === 'NEW_PERSON' ? 'Creating New Person Entry' : 'Editing Existing Details'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Client / Person Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Sagar Gaydhane"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Property Type</label>
                <input
                  type="text"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder="3BHK Apartment, Villa..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Site Address / Location</label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="Flat 1802, Wadhwa Wise City, Mumbai"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Target Budget (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="1000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Client requirement notes saved successfully to database!
            </div>
          )}

          {/* QUICK REQUIREMENT PRESET TEMPLATES / SERVICE PLAN SHORTCUTS */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-400" /> Quick Requirement Preset Templates (Service Plans)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select a pre-configured Service Plan shortcut (2BHK, 3BHK, Modular Kitchen) to view & unpack its bundled services into client requirements.
                </p>
              </div>

              {servicePlans.length > 0 && (
                <span className="text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg w-fit">
                  {servicePlans.length} Plans Created in Catalogue
                </span>
              )}
            </div>

            {/* Service Plan Preset Shortcut Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {servicePlans.map((plan) => {
                const isSelected = activeSelectedPlan?.id === plan.id;
                let count = 0;
                if (Array.isArray(plan.packageItems)) count = plan.packageItems.length;
                else if (typeof plan.packageItems === 'string') {
                  try { count = JSON.parse(plan.packageItems).length; } catch (e) {}
                }

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleAddServicePlan(plan)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-amber-500/20'
                        : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-amber-500/30 hover:border-amber-400'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>{plan.title}</span>
                    {count > 0 && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-amber-500/20 text-amber-300'}`}>
                        {count} Services
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Fallback to presets if catalogue empty */}
              {servicePlans.length === 0 &&
                REQUIREMENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {preset.name}
                  </button>
                ))}
            </div>

            {/* SERVICE ITEMS LISTING OF SELECTED SERVICE PLAN */}
            {activeSelectedPlan && (
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3 mt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" /> Listing of Included Sub-Service Items:
                    </span>
                    <span className="text-slate-200 font-bold text-xs bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                      {activeSelectedPlan.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddServicePlan(activeSelectedPlan)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Re-add All Items
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSelectedPlan(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs font-bold px-1.5"
                    >
                      ✕ Close Listing
                    </button>
                  </div>
                </div>

                {/* Sub-Service Items Listing Table */}
                {(() => {
                  let subList: any[] = [];
                  if (Array.isArray(activeSelectedPlan.packageItems)) subList = activeSelectedPlan.packageItems;
                  else if (typeof activeSelectedPlan.packageItems === 'string') {
                    try { subList = JSON.parse(activeSelectedPlan.packageItems); } catch (e) {}
                  }

                  if (subList.length === 0) {
                    return (
                      <p className="text-slate-400 text-xs italic">
                        This plan has 1 package service unit ({formatINR(activeSelectedPlan.defaultPrice)}).
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {subList.map((sub: any, sIdx: number) => (
                          <div key={sIdx} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                                <span className="text-amber-400 font-mono font-bold">•</span> {sub.title}
                              </span>
                              {sub.category && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                                  {sub.category}
                                </span>
                              )}
                            </div>
                            {sub.description && (
                              <p className="text-[10px] text-slate-400 leading-normal">{sub.description}</p>
                            )}
                            {sub.defaultPrice !== undefined && sub.defaultPrice > 0 && (
                              <p className="text-[10px] font-mono text-amber-300 font-bold">
                                Default Rate: {formatINR(sub.defaultPrice)} / {sub.unit || 'unit'}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-emerald-400 font-semibold pt-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        All {subList.length} sub-services listed above have been unpacked into your requirements below. You can edit rates or delete individual items below.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* SERVICE CATALOGUE DROPDOWN SELECTOR SECTION */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Select Single Requirements from Service Catalogue
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pick individual services directly from your master catalogue to add to client requirements.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {selectedRequirements.length} Selected Items
              </span>
            </div>

            {/* Category Filter & Catalogue Dropdown Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Category Filter */}
              <div className="md:col-span-4">
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Service Category Filter</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedCatalogueId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Categories ({catalogueItems.length})</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Item Dropdown */}
              <div className="md:col-span-5">
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Service Item Dropdown *</label>
                <select
                  value={selectedCatalogueId}
                  onChange={(e) => setSelectedCatalogueId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Service from Catalogue --</option>
                  {filteredCatalogueOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.category}] {item.title} {item.defaultPrice ? `(₹${item.defaultPrice}/${item.unit || 'unit'})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={handleAddRequirementFromCatalogue}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <ListPlus className="w-4 h-4" /> Add Service Requirement
                </button>
              </div>
            </div>

            {/* List of Selected Service Catalogue Requirements */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-slate-300 font-bold block">
                Selected Service Catalogue Requirements List:
              </span>
              {selectedRequirements.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No service catalogue items added yet. Choose a category & service item above and click "+ Add Service Requirement".
                </div>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {selectedRequirements.map((req, idx) => (
                    <div
                      key={req.id || idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs group hover:border-amber-500/40 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">
                            {req.category}
                          </span>
                          <span className="font-bold text-slate-100">{req.title}</span>
                          {req.defaultPrice !== undefined && req.defaultPrice !== null && (
                            <span className="font-mono font-bold text-amber-300 text-[11px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                              ₹{req.defaultPrice} / {req.unit || 'unit'}
                            </span>
                          )}
                        </div>
                        {req.description && (
                          <p className="text-[11px] text-slate-400 leading-normal">{req.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingRequirement(req)}
                          className="text-slate-400 hover:text-amber-400 p-1.5 rounded hover:bg-amber-500/10 transition-colors border border-transparent hover:border-amber-500/30"
                          title="Edit Price & Description for this client"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(req.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/30"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DEDICATED ADDITIONAL NOTES SECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Notebook className="w-4 h-4 text-amber-400" /> Additional Notes & Custom Client Instructions:
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Free-form custom notes</span>
            </div>

            <textarea
              rows={6}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Record any additional notes, custom requests, or special instructions here:\n- Preferred finishes (e.g. Acrylic Gloss vs Textured Veneer)\n- Hardware brand preferences (Hettich / Blum / Hafele)\n- Site access timings & elevator restrictions\n- Target handover timeline & milestone dates..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>

          {/* Bottom Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4 text-amber-400" /> {saving ? 'Saving to Database...' : 'Save Requirement Notes'}
            </button>

            <button
              onClick={handleGenerateQuotation}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <FileText className="w-4 h-4" /> Generate Quotation BOQ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* REQUIREMENT BRIEF PDF PRINT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-3xl w-full p-6 rounded-3xl border border-amber-500/30 space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex flex-col space-y-3 border-b border-slate-800 pb-4 no-print">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Client Requirement Brief Print Center</h3>
                  <p className="text-xs text-slate-400">Pre-Quotation Briefing Document</p>
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

            {/* Printable Document Canvas */}
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
                  <span className="font-mono text-amber-800">CLIENT REQUIREMENT BRIEF</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              ) : letterheadMode === 'banner' && company?.letterheadUrl ? (
                <div className="w-full border-b border-slate-200 pb-3">
                  <img src={company.letterheadUrl} alt="Header Banner" className="w-full h-28 object-cover object-top rounded-lg" />
                  <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-500 font-bold">
                    <span className="font-mono text-amber-700">CLIENT REQUIREMENT BRIEF</span>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {company?.logoUrl && <img src={company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />}
                    <div>
                      <h1 className="text-2xl font-extrabold text-amber-600">{company?.name || 'CLIENT REQUIREMENT BRIEF'}</h1>
                      <p className="text-slate-600 font-semibold">CLIENT REQUIREMENT BRIEF • {company?.tagline || 'Pre-Quotation Documentation'}</p>
                      <p className="text-[11px] text-slate-500">{company?.address || 'Turnkey Architectural & Fitout Brief'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-950 text-amber-400 font-mono font-bold text-xs rounded">
                      REQ-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">CLIENT / PERSON DETAILS</p>
                  <p className="text-sm font-bold text-slate-900">{clientName || 'N/A'}</p>
                  <p className="text-slate-600">Phone: {clientPhone || 'N/A'}</p>
                  {clientEmail && <p className="text-slate-600">Email: {clientEmail}</p>}
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">PROPERTY & BUDGET</p>
                  <p className="text-xs font-bold text-slate-800">Property: {propertyType || 'N/A'}</p>
                  <p className="text-slate-600">Site Location: {siteAddress || 'N/A'}</p>
                  {budget && <p className="text-slate-800 font-bold font-mono">Target Budget: ₹{Number(budget).toLocaleString('en-IN')}</p>}
                </div>
              </div>

              {/* Selected Catalogue Requirements Table */}
              {selectedRequirements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
                    SELECTED SERVICE CATALOGUE REQUIREMENTS ({selectedRequirements.length} ITEMS)
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Service Title</th>
                          <th className="p-2">Specifications / Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRequirements.map((req, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                            <td className="p-2 font-bold text-amber-700">{req.category}</td>
                            <td className="p-2 font-bold text-slate-900">{req.title}</td>
                            <td className="p-2 text-slate-600">{req.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {additionalNotes.trim() && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
                    ADDITIONAL NOTES & CUSTOM INSTRUCTIONS
                  </h3>
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                    <p className="text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                      {additionalNotes}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <p>Prepared by Interio Architecture & Turnkey Design Studio</p>
                <p>Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REQUIREMENT MODAL */}
      {editingRequirement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" /> Edit Requirement Specification
                </h3>
                <p className="text-[10px] text-amber-400 mt-0.5 font-semibold">
                  Custom rates & descriptions are saved ONLY for this client/lead.
                </p>
              </div>
              <button onClick={() => setEditingRequirement(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedRequirement} className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block mb-0.5">Item Title</span>
                <p className="font-bold text-slate-100 text-sm">{editingRequirement.title}</p>
                <span className="text-[10px] text-amber-300 font-semibold">Category: {editingRequirement.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Custom Rate / Price (₹) *</label>
                  <input
                    type="number"
                    value={editingRequirement.defaultPrice !== undefined && editingRequirement.defaultPrice !== null ? editingRequirement.defaultPrice : ''}
                    onChange={(e) =>
                      setEditingRequirement({
                        ...editingRequirement,
                        defaultPrice: e.target.value !== '' ? parseFloat(e.target.value) : ''
                      })
                    }
                    placeholder="1850"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Measuring Unit</label>
                  <input
                    type="text"
                    value={editingRequirement.unit || 'sq.ft'}
                    onChange={(e) =>
                      setEditingRequirement({
                        ...editingRequirement,
                        unit: e.target.value
                      })
                    }
                    placeholder="sq.ft / r.ft / unit"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Item Description & Material Specs</label>
                <textarea
                  rows={3}
                  value={editingRequirement.description || ''}
                  onChange={(e) =>
                    setEditingRequirement({
                      ...editingRequirement,
                      description: e.target.value
                    })
                  }
                  placeholder="Customized specifications for this client..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRequirement(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
                >
                  Save Item Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientRequirementsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ClientRequirementsContent />
    </Suspense>
  );
}
