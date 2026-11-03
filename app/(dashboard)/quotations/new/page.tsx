'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  DollarSign,
  CheckCircle,
  Percent,
  Calendar,
  Notebook,
  Sparkles,
  Zap,
  ListChecks,
  Wand2,
  ChevronRight,
  ChevronLeft,
  ListPlus,
  RefreshCw,
  Edit
} from 'lucide-react';

const ROOMS = ['Living Room', 'Modular Kitchen', 'Master Bedroom', 'Bedroom 2', 'Dining Area', 'Balcony', 'General / Turnkey'];

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

const REQUIREMENT_PRESETS = [
  {
    name: '3BHK Luxury Turnkey Fitout',
    notes: 'Client Requirement Brief:\n- Property: 3BHK Apartment (~1350 sq.ft)\n- Modular Kitchen: Acrylic finish BWP Plywood with tandem drawers & Hettich soft-close hinges.\n- Living Room: Saint Gobain Gypsum false ceiling with cove lighting & TV Unit in Louvers & Veneer.\n- Master Bedroom: Full height sliding wardrobe with lacquered glass & king size bed back cushioning.\n- Target Budget: ₹12.5 Lakhs.',
    sampleItems: [
      { room: 'Modular Kitchen', category: 'Modular Kitchen', title: 'Acrylic BWP Modular Kitchen', description: 'BWP Marine Ply boxes with 1.5mm High Gloss Acrylic Shutters & Hettich fittings', quantity: 180, unit: 'sq.ft', unitRate: 1850 },
      { room: 'Living Room', category: 'False Ceiling', title: 'Gypsum Board False Ceiling with Cove Lighting', description: 'Saint Gobain Gypsum Board with magnetic track & LED cove lights', quantity: 320, unit: 'sq.ft', unitRate: 145 },
      { room: 'Living Room', category: 'Decor & Panel', title: 'Fluted Panel TV Unit & Veneer Panel', description: 'Charcoal fluted louvers with HDMR veneer panel and ambient strip light', quantity: 1, unit: 'unit', unitRate: 65000 },
      { room: 'Master Bedroom', category: 'Wardrobe', title: 'Full Height Sliding Wardrobe with Glass', description: '18mm CenturyPly carcass with lacquered glass sliding doors', quantity: 120, unit: 'sq.ft', unitRate: 1950 }
    ]
  },
  {
    name: '2BHK Budget Friendly Fitout',
    notes: 'Client Requirement Brief:\n- Property: 2BHK Apartment (~850 sq.ft)\n- Modular Kitchen: L-Shape Laminate finish with SS basket drawers.\n- Living Room: Perimeter border ceiling with LED spot lights.\n- Master Bedroom: 2-Door Laminate wardrobe with loft storage.\n- Target Budget: ₹6.5 Lakhs.',
    sampleItems: [
      { room: 'Modular Kitchen', category: 'Modular Kitchen', title: 'Laminate Finish Modular Kitchen', description: 'Commercial Ply with 1mm Merino Gloss Laminate & SS Soft Close Baskets', quantity: 140, unit: 'sq.ft', unitRate: 1450 },
      { room: 'Living Room', category: 'False Ceiling', title: 'Perimeter Border Gypsum Ceiling', description: 'Saint Gobain perimeter ceiling with LED warm spots', quantity: 200, unit: 'sq.ft', unitRate: 135 },
      { room: 'Master Bedroom', category: 'Wardrobe', title: 'Hinged Door Wardrobe with Loft', description: '18mm Commercial Ply with suede finish laminate', quantity: 90, unit: 'sq.ft', unitRate: 1550 }
    ]
  },
  {
    name: 'Modular Kitchen Special',
    notes: 'Client Requirement Brief:\n- Modular Kitchen Requisition:\n- Parallel Kitchen Layout.\n- Bottom Carcass: Heavy BWP Plywood with Quartz Stone Countertop.\n- Overhead Cabinets: Frosted Glass Aluminium Profile doors with hydraulic lift-ups.',
    sampleItems: [
      { room: 'Modular Kitchen', category: 'Modular Kitchen', title: 'Parallel BWP Modular Kitchen', description: 'BWP Plywood carcass with Quartz countertop & Blum hardware', quantity: 160, unit: 'sq.ft', unitRate: 1950 },
      { room: 'Modular Kitchen', category: 'Appliances', title: 'Profile Glass Overhead Cabinets', description: 'Black aluminium profile with frosted glass & Blum AVENTOS lift-up', quantity: 60, unit: 'sq.ft', unitRate: 2200 }
    ]
  }
];

function mapCategoryToRoom(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('kitchen')) return 'Modular Kitchen';
  if (cat.includes('ceiling')) return 'Living Room';
  if (cat.includes('wardrobe')) return 'Master Bedroom';
  if (cat.includes('bedroom')) return 'Master Bedroom';
  if (cat.includes('decor') || cat.includes('panel') || cat.includes('tv')) return 'Living Room';
  if (cat.includes('balcony')) return 'Balcony';
  if (cat.includes('dining')) return 'Dining Area';
  return 'General / Turnkey';
}

function QuotationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryQuoteId = searchParams.get('id') || searchParams.get('quoteId') || searchParams.get('editId') || '';
  const isEditMode = Boolean(queryQuoteId);

  const queryClientId = searchParams.get('clientId') || '';
  const queryLeadId = searchParams.get('leadId') || '';
  const queryNotes = searchParams.get('notes') || '';

  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteStatus, setQuoteStatus] = useState('Draft');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [catalogue, setCatalogue] = useState<any[]>(DEFAULT_CATALOGUE);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState<'requirements' | 'boq' | 'financials'>('requirements');

  // Form state
  const [targetType, setTargetType] = useState<'CLIENT' | 'LEAD'>(queryLeadId ? 'LEAD' : 'CLIENT');
  const [selectedClientId, setSelectedClientId] = useState(queryLeadId || queryClientId);
  const [siteAddress, setSiteAddress] = useState('');
  const [requirementNotes, setRequirementNotes] = useState(queryNotes);

  // Service Catalogue Selector in Tab 1
  const [selectedReqCategory, setSelectedReqCategory] = useState<string>('ALL');
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>('');
  const [selectedRequirements, setSelectedRequirements] = useState<any[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntilDate, setValidUntilDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [discountPct, setDiscountPct] = useState<number>(5);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState(18);
  const [validityDays, setValidityDays] = useState(30);
  const [terms, setTerms] = useState(
    '1. 10% Booking Advance\n2. 40% on Design Signoff & Factory Production\n3. 40% on Site Material Delivery\n4. 10% on Final Handover & Snag Clearance\n5. Proposal valid for 30 days.'
  );

  const [items, setItems] = useState<any[]>([]);

  // Automatically convert requirement items into BOQ line items
  const autoConvertRequirementsToBOQ = (reqs: any[], catList: any[]) => {
    if (!reqs || reqs.length === 0) return;

    const newBoqItems = reqs.map((req) => {
      const match = catList.find(
        (c) => c.title?.toLowerCase() === req.title?.toLowerCase() || c.category?.toLowerCase() === req.category?.toLowerCase()
      );

      return {
        room: mapCategoryToRoom(req.category),
        category: req.category || 'General',
        title: req.title,
        description: req.description || match?.description || '',
        quantity: req.quantity || (match?.unit === 'sq.ft' ? 120 : 1),
        unit: req.unit || match?.unit || 'sq.ft',
        unitRate: req.defaultPrice || match?.defaultPrice || 1500
      };
    });

    setItems(newBoqItems);
  };

  const parseNotesField = (rawNotes: string, catList: any[] = catalogue, skipBoqConvert = false) => {
    if (!rawNotes) return;
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
          const rest = catMatch[2];
          const [title, ...descArr] = rest.split(' - ');
          const matchedCatItem = catList.find((c) => c.title?.toLowerCase() === title?.trim().toLowerCase());

          return {
            id: `parsed-${i}-${Date.now()}`,
            category: cat,
            title: title ? title.trim() : clean,
            description: descArr.join(' - '),
            unit: matchedCatItem?.unit || 'sq.ft',
            defaultPrice: matchedCatItem?.defaultPrice || 1500
          };
        }
        return {
          id: `parsed-${i}-${Date.now()}`,
          category: 'General',
          title: clean,
          description: '',
          unit: 'unit',
          defaultPrice: 1000
        };
      });

      setSelectedRequirements(parsedReqs);
      setAdditionalNotes(extraPart.trim());

      if (!skipBoqConvert) {
        autoConvertRequirementsToBOQ(parsedReqs, catList);
      }
    } else {
      setSelectedRequirements([]);
      setAdditionalNotes(rawNotes);
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

    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = '';
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id) compId = comp.id;
      } catch (e) {}
    }

    const clientUrl = compId ? `/api/clients?companyId=${compId}` : '/api/clients';
    const leadUrl = compId ? `/api/leads?companyId=${compId}` : '/api/leads';
    const catUrl = compId ? `/api/catalogue?companyId=${compId}` : '/api/catalogue';

    const fetchPromises: Promise<any>[] = [
      fetch(clientUrl).then((res) => res.json()).catch(() => []),
      fetch(leadUrl).then((res) => res.json()).catch(() => []),
      fetch(catUrl).then((res) => res.json()).catch(() => [])
    ];

    if (queryQuoteId) {
      fetchPromises.push(
        fetch(`/api/quotations/${queryQuoteId}`).then((res) => res.json()).catch(() => null)
      );
    }

    Promise.all(fetchPromises)
      .then(([cls, lds, cat, existingQuoteData]) => {
        let activeCatList = DEFAULT_CATALOGUE;
        if (Array.isArray(cat) && cat.length > 0) {
          const combined = [...cat];
          DEFAULT_CATALOGUE.forEach((def) => {
            if (!combined.some((c) => c.title?.toLowerCase() === def.title.toLowerCase())) {
              combined.push(def);
            }
          });
          activeCatList = combined;
          setCatalogue(combined);
        }

        if (Array.isArray(cls)) setClients(cls);
        if (Array.isArray(lds)) setLeads(lds);

        // EDIT MODE: Populate from existing quotation
        if (existingQuoteData && !existingQuoteData.error && existingQuoteData.id) {
          setQuoteNumber(existingQuoteData.quoteNumber || '');
          setQuoteStatus(existingQuoteData.status || 'Draft');
          setClientName(existingQuoteData.clientName || '');
          setClientPhone(existingQuoteData.clientPhone || '');
          setSiteAddress(existingQuoteData.siteAddress || '');
          setTerms(existingQuoteData.terms || '1. 10% Booking Advance\n2. 40% on Design Signoff & Factory Production\n3. 40% on Site Material Delivery\n4. 10% on Final Handover & Snag Clearance\n5. Proposal valid for 30 days.');
          setTaxRate(existingQuoteData.taxRate !== undefined ? existingQuoteData.taxRate : 18);
          setValidityDays(existingQuoteData.validityDays || 30);

          if (existingQuoteData.createdDate || existingQuoteData.createdAt) {
            setCreatedDate(new Date(existingQuoteData.createdDate || existingQuoteData.createdAt).toISOString().split('T')[0]);
          }
          if (existingQuoteData.validUntilDate) {
            setValidUntilDate(new Date(existingQuoteData.validUntilDate).toISOString().split('T')[0]);
          }

          const disc = existingQuoteData.discountAmount || 0;
          setDiscountAmount(disc);
          if (existingQuoteData.subtotal > 0 && disc > 0) {
            const pct = Math.round((disc / existingQuoteData.subtotal) * 100);
            if (Math.abs((existingQuoteData.subtotal * pct) / 100 - disc) < 1) {
              setDiscountType('percentage');
              setDiscountPct(pct);
            } else {
              setDiscountType('flat');
            }
          }

          if (existingQuoteData.leadId) {
            setTargetType('LEAD');
            setSelectedClientId(existingQuoteData.leadId);
          } else if (existingQuoteData.clientId) {
            setTargetType('CLIENT');
            setSelectedClientId(existingQuoteData.clientId);
          }

          if (existingQuoteData.requirementNotes) {
            setRequirementNotes(existingQuoteData.requirementNotes);
            parseNotesField(existingQuoteData.requirementNotes, activeCatList, true);
          }

          if (Array.isArray(existingQuoteData.items) && existingQuoteData.items.length > 0) {
            setItems(existingQuoteData.items.map((it: any) => ({
              id: it.id,
              room: it.room || 'General',
              category: it.category || 'General',
              title: it.title || '',
              description: it.description || '',
              quantity: it.quantity !== undefined ? it.quantity : 1,
              unit: it.unit || 'sq.ft',
              unitRate: it.unitRate !== undefined ? it.unitRate : 0
            })));
          }
        } else {
          // CREATE MODE: Initial defaults
          if (queryLeadId && Array.isArray(lds)) {
            setTargetType('LEAD');
            const targetLead = lds.find((l) => l.id === queryLeadId);
            if (targetLead) {
              setSelectedClientId(targetLead.id);
              setClientName(targetLead.name || '');
              setClientPhone(targetLead.phone || '');
              setSiteAddress(targetLead.location || '');
              if (!queryNotes && targetLead.notes) {
                setRequirementNotes(targetLead.notes);
                parseNotesField(targetLead.notes, activeCatList);
              }
            }
          } else if (Array.isArray(cls) && cls.length > 0) {
            setTargetType('CLIENT');
            const targetId = queryClientId || cls[0].id;
            setSelectedClientId(targetId);
            const found = cls.find((c) => c.id === targetId) || cls[0];
            setClientName(found.name || '');
            setClientPhone(found.phone || '');
            setSiteAddress(found.address || found.city || '');
            if (!queryNotes && found.notes) {
              setRequirementNotes(found.notes);
              parseNotesField(found.notes, activeCatList);
            }
          }

          if (queryNotes) {
            parseNotesField(queryNotes, activeCatList);
          } else if (items.length === 0) {
            setItems([
              { room: 'Modular Kitchen', category: 'Modular Kitchen', title: 'Acrylic BWP Modular Kitchen', description: 'BWP Marine Ply boxes with 1.5mm High Gloss Acrylic Shutters', quantity: 180, unit: 'sq.ft', unitRate: 1850 }
            ]);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [queryClientId, queryLeadId, queryNotes, queryQuoteId]);

  // Sync compiled notes to master requirementNotes state when requirements or additional notes are updated
  useEffect(() => {
    if (!selectedRequirements.length && !additionalNotes.trim()) return;
    let text = '';
    if (selectedRequirements.length > 0) {
      text += '--- SELECTED SERVICE CATALOGUE REQUIREMENTS ---\n';
      selectedRequirements.forEach((item) => {
        text += `• [${item.category}] ${item.title}${item.description ? ` - ${item.description}` : ''}\n`;
      });
    }
    if (additionalNotes.trim()) {
      if (text) text += '\n';
      text += '--- ADDITIONAL NOTES & INSTRUCTIONS ---\n';
      text += additionalNotes.trim();
    }
    setRequirementNotes(text);
  }, [selectedRequirements, additionalNotes]);

  const handleApplyPreset = (preset: typeof REQUIREMENT_PRESETS[0]) => {
    setAdditionalNotes(preset.notes);
    if (preset.sampleItems) setItems(preset.sampleItems);
  };

  const handleAddRequirementFromCatalogue = () => {
    if (!selectedCatalogueId) {
      alert('Please select a service item from the catalogue dropdown');
      return;
    }
    const item = catalogue.find((c) => c.id === selectedCatalogueId);
    if (!item) return;

    if (selectedRequirements.some((r) => r.title === item.title)) {
      alert(`"${item.title}" is already added to requirements.`);
      return;
    }

    const newReqItem = {
      id: `req-${Date.now()}-${Math.random()}`,
      category: item.category || 'General',
      title: item.title,
      description: item.description || '',
      unit: item.unit,
      defaultPrice: item.defaultPrice
    };

    const updatedReqs = [...selectedRequirements, newReqItem];
    setSelectedRequirements(updatedReqs);

    // AUTOMATICALLY ADD TO BOQ SCOPE OF WORK LINE ITEMS
    setItems((prev) => [
      ...prev,
      {
        room: mapCategoryToRoom(item.category),
        category: item.category || 'General',
        title: item.title,
        description: item.description || '',
        quantity: item.unit === 'sq.ft' ? 120 : 1,
        unit: item.unit || 'sq.ft',
        unitRate: item.defaultPrice || 1500
      }
    ]);

    setSelectedCatalogueId('');
  };

  const handleRemoveRequirement = (id: string) => {
    const itemToRemove = selectedRequirements.find((r) => r.id === id);
    if (itemToRemove) {
      setItems(items.filter((i) => i.title !== itemToRemove.title));
    }
    setSelectedRequirements(selectedRequirements.filter((r) => r.id !== id));
  };

  const handleSyncAllRequirementsToBOQ = () => {
    autoConvertRequirementsToBOQ(selectedRequirements, catalogue);
    alert(`Successfully synced ${selectedRequirements.length} requirement services into BOQ Line Items!`);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { room: 'Living Room', category: 'False Ceiling', title: 'Gypsum Board False Ceiling', description: 'Saint Gobain Gypsum Board with cove lighting', quantity: 300, unit: 'sq.ft', unitRate: 145 }
    ]);
  };

  const handleAddFromCatalogue = (catItem: any) => {
    setItems([
      ...items,
      {
        room: mapCategoryToRoom(catItem.category),
        category: catItem.category,
        title: catItem.title,
        description: catItem.description,
        quantity: catItem.unit === 'sq.ft' ? 100 : 1,
        unit: catItem.unit || 'unit',
        unitRate: catItem.defaultPrice
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitRate) || 0), 0);

  const computedDiscountAmount = discountType === 'percentage'
    ? (subtotal * discountPct) / 100
    : discountAmount;

  const netSubtotal = Math.max(0, subtotal - computedDiscountAmount);
  const taxAmount = (netSubtotal * taxRate) / 100;
  const grandTotal = netSubtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId && !isEditMode) {
      alert('Please select a client or lead');
      return;
    }

    let targetClient = null;
    let targetLead = null;
    if (targetType === 'LEAD') {
      targetLead = leads.find((l) => l.id === selectedClientId);
    } else {
      targetClient = clients.find((c) => c.id === selectedClientId);
    }

    const activeCompStr = localStorage.getItem('interio_active_company');
    let compId = '';
    if (activeCompStr) {
      try {
        const comp = JSON.parse(activeCompStr);
        if (comp?.id) compId = comp.id;
      } catch (e) {}
    }

    setSubmitting(true);

    try {
      const endpoint = isEditMode ? `/api/quotations/${queryQuoteId}` : '/api/quotations';
      const method = isEditMode ? 'PATCH' : 'POST';

      const finalClientName = clientName || (targetType === 'LEAD' ? (targetLead?.name || 'CRM Lead') : (targetClient?.name || 'Client'));
      const finalClientPhone = clientPhone || (targetType === 'LEAD' ? (targetLead?.phone || '') : (targetClient?.phone || ''));

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: compId,
          clientId: targetType === 'CLIENT' ? selectedClientId : null,
          leadId: targetType === 'LEAD' ? selectedClientId : null,
          clientName: finalClientName,
          clientPhone: finalClientPhone,
          siteAddress,
          status: isEditMode ? quoteStatus : 'Draft',
          createdDate,
          validUntilDate,
          subtotal,
          discountAmount: computedDiscountAmount,
          taxRate,
          taxAmount,
          grandTotal,
          validityDays,
          terms,
          requirementNotes,
          items
        })
      });

      if (res.ok) {
        router.push('/quotations');
      } else {
        const errData = await res.json();
        alert(errData.error || (isEditMode ? 'Failed to update quotation' : 'Failed to create quotation'));
        setSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      alert('Network or server error while saving quotation');
      setSubmitting(false);
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const availableCategories = Array.from(new Set(catalogue.map((c) => c.category || 'General'))).sort();
  const filteredCatalogueOptions = selectedReqCategory === 'ALL'
    ? catalogue
    : catalogue.filter((c) => c.category === selectedReqCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/quotations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotations List
        </Link>
        <div className="flex items-center gap-2">
          {isEditMode && quoteNumber && (
            <span className="text-xs text-slate-300 font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              Proposal: <strong className="text-amber-400 font-bold">{quoteNumber}</strong>
            </span>
          )}
          <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" /> {isEditMode ? 'Edit Quotation & Proposal' : 'Quotation Builder Studio'}
          </span>
        </div>
      </div>

      {/* SEPARATE TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveStepTab('requirements')}
          className={`px-5 py-3 rounded-2xl border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeStepTab === 'requirements'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Notebook className="w-4 h-4 text-amber-400" />
          <span>Tab 1: Client Requirements Notepad ({selectedRequirements.length} Services)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStepTab('boq')}
          className={`px-5 py-3 rounded-2xl border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeStepTab === 'boq'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <ListChecks className="w-4 h-4 text-amber-400" />
          <span>Tab 2: Scope of Work & BOQ ({items.length} Auto-Added Items)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStepTab('financials')}
          className={`px-5 py-3 rounded-2xl border transition-all flex items-center gap-2 whitespace-nowrap ${
            activeStepTab === 'financials'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>Tab 3: Financial Summary ({formatINR(grandTotal)})</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Site Header */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          {isEditMode && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  Editing: {quoteNumber || 'Quotation'}
                </span>
                <span className="text-xs text-slate-400">
                  Update line items, pricing, client details, and status. All changes will be saved directly.
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label className="text-slate-400 font-semibold">Proposal Status:</label>
                <select
                  value={quoteStatus}
                  onChange={(e) => setQuoteStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted (Converts to Project)</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-400 font-semibold">Target Client / CRM Lead *</label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('CLIENT');
                      if (clients.length > 0) {
                        setSelectedClientId(clients[0].id);
                        setClientName(clients[0].name || '');
                        setClientPhone(clients[0].phone || '');
                        setSiteAddress(clients[0].address || clients[0].city || '');
                        if (clients[0].notes) parseNotesField(clients[0].notes, catalogue);
                      }
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      targetType === 'CLIENT' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Clients ({clients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('LEAD');
                      if (leads.length > 0) {
                        setSelectedClientId(leads[0].id);
                        setClientName(leads[0].name || '');
                        setClientPhone(leads[0].phone || '');
                        setSiteAddress(leads[0].location || '');
                        if (leads[0].notes) parseNotesField(leads[0].notes, catalogue);
                      }
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      targetType === 'LEAD' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    CRM Leads ({leads.length})
                  </button>
                </div>
              </div>

              <select
                value={selectedClientId}
                onChange={(e) => {
                  const targetId = e.target.value;
                  setSelectedClientId(targetId);
                  if (targetType === 'LEAD') {
                    const found = leads.find((l) => l.id === targetId);
                    if (found) {
                      setClientName(found.name || '');
                      setClientPhone(found.phone || '');
                      setSiteAddress(found.location || '');
                      if (found.notes) parseNotesField(found.notes, catalogue);
                    }
                  } else {
                    const found = clients.find((c) => c.id === targetId);
                    if (found) {
                      setClientName(found.name || '');
                      setClientPhone(found.phone || '');
                      setSiteAddress(found.address || found.city || '');
                      if (found.notes) parseNotesField(found.notes, catalogue);
                    }
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
              >
                {targetType === 'CLIENT'
                  ? clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - {c.propertyType || 'Client'}
                      </option>
                    ))
                  : leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        [Lead] {l.name} ({l.phone}) - {l.location || 'Mumbai'}
                      </option>
                    ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold">Site Address *</label>
              <input
                type="text"
                required
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="Flat 1802, Wadhwa Wise City, Panvel"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Client / Contact Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Client Phone</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Proposal Date</label>
              <input
                type="date"
                value={createdDate}
                onChange={(e) => setCreatedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Valid Until</label>
              <input
                type="date"
                value={validUntilDate}
                onChange={(e) => setValidUntilDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: CLIENT REQUIREMENT NOTEPAD WITH SERVICE CATALOGUE DROPDOWN & ADDITIONAL NOTES */}
        {activeStepTab === 'requirements' && (
          <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Notebook className="w-5 h-5 text-amber-400" /> Client Requirement Briefing Notepad
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select requirement services directly from catalogue dropdown. Added services automatically populate into BOQ line items!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveStepTab('boq')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 self-start sm:self-auto"
              >
                Next Step: Scope & BOQ ({items.length} Items) <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Requirement Presets */}
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Insert Pre-defined Requirement Template:
              </span>
              <div className="flex flex-wrap gap-2">
                {REQUIREMENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SERVICE CATALOGUE DROPDOWN SELECTOR */}
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" /> Select Requirements from Service Catalogue Dropdown
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    ⚡ Selected service requirements automatically populate into BOQ Scope of Work!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRequirements.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSyncAllRequirementsToBOQ}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Auto-Sync to BOQ
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {selectedRequirements.length} Selected
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Service Category Filter</label>
                  <select
                    value={selectedReqCategory}
                    onChange={(e) => {
                      setSelectedReqCategory(e.target.value);
                      setSelectedCatalogueId('');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Categories ({catalogue.length})</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-5">
                  <label className="block text-[10px] text-slate-400 font-semibold mb-1">Service Item Dropdown *</label>
                  <select
                    value={selectedCatalogueId}
                    onChange={(e) => setSelectedCatalogueId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Service from Catalogue --</option>
                    {filteredCatalogueOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.category}] {item.title} {item.defaultPrice ? `(₹${item.defaultPrice}/${item.unit || 'unit'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddRequirementFromCatalogue}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                  >
                    <ListPlus className="w-4 h-4" /> + Add to Requirement & BOQ
                  </button>
                </div>
              </div>

              {/* Selected List */}
              {selectedRequirements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] text-slate-300 font-bold block">Selected Catalogue Requirements:</span>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedRequirements.map((req, idx) => (
                      <div
                        key={req.id || idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">
                              {req.category}
                            </span>
                            <span className="font-bold text-slate-100">{req.title}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                              ✓ Auto-added to BOQ
                            </span>
                          </div>
                          {req.description && <p className="text-[11px] text-slate-400">{req.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(req.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DEDICATED ADDITIONAL NOTES */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">Additional Notes & Custom Client Instructions:</label>
              <textarea
                rows={6}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Client requested acrylic gloss finish, 3BHK Gypsum false ceiling with cove lights, delivery required within 45 days..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/80 leading-relaxed shadow-inner"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStepTab('boq')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                Proceed to Scope & BOQ ({items.length} Items) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BOQ SCOPE OF WORK BUILDER */}
        {activeStepTab === 'boq' && (
          <div className="space-y-6">
            {/* Quick Catalogue Picker & Auto Sync Notice */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Add Pre-defined Items from Master Catalogue
                </span>
                {selectedRequirements.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSyncAllRequirementsToBOQ}
                    className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-Sync {selectedRequirements.length} Requirement Services
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {catalogue.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleAddFromCatalogue(cat)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 rounded-xl whitespace-nowrap text-[11px] font-medium transition-colors"
                  >
                    + {cat.title} ({formatINR(cat.defaultPrice)})
                  </button>
                ))}
              </div>
            </div>

            {/* Itemized BOQ Table */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-amber-400" /> Room-by-Room Scope of Work & BOQ Line Items
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Services selected in Client Requirements Notepad are automatically populated here into line items.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Custom Line Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 relative group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Room Section</label>
                        <select
                          value={item.room}
                          onChange={(e) => updateItem(index, 'room', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-amber-300 font-semibold focus:outline-none"
                        >
                          {ROOMS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Item Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(index, 'title', e.target.value)}
                          placeholder="Item Title"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Unit Rate (INR)</label>
                        <input
                          type="number"
                          value={item.unitRate}
                          onChange={(e) => updateItem(index, 'unitRate', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4 md:pt-0">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Total</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {formatINR((parseFloat(item.quantity) || 0) * (parseFloat(item.unitRate) || 0))}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Material specs, hardware brand (e.g. Hettich soft close, Marine Ply)..."
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStepTab('requirements')}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous: Requirements
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> {submitting ? 'Saving...' : (isEditMode ? 'Save & Update Proposal' : 'Save Proposal')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStepTab('financials')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  Next Step: Financials <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL SUMMARY & TERMS */}
        {activeStepTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100">Payment Terms & Validity</h3>
                <textarea
                  rows={6}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-100">Financial Summary</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal BOQ:</span>
                    <span className="font-mono font-bold text-slate-100">{formatINR(subtotal)}</span>
                  </div>

                  {/* Discount Input */}
                  <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Discount Offer</span>
                      <div className="flex items-center gap-1 text-[10px] bg-slate-950 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setDiscountType('percentage')}
                          className={`px-2 py-0.5 rounded font-bold ${
                            discountType === 'percentage' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          % Percent
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('flat')}
                          className={`px-2 py-0.5 rounded font-bold ${
                            discountType === 'flat' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          ₹ Flat Amount
                        </button>
                      </div>
                    </div>

                    {discountType === 'percentage' ? (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-[11px] text-slate-400">Discount % Rate:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={discountPct}
                            onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-emerald-400 font-bold focus:outline-none"
                          />
                          <span className="font-bold text-emerald-400">({formatINR(computedDiscountAmount)})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-[11px] text-slate-400">Flat Discount (₹):</span>
                        <input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                          className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-emerald-400 font-bold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>GST Tax Rate (%):</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-slate-200 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                    <span>Tax Amount:</span>
                    <span className="font-mono text-slate-200">{formatINR(taxAmount)}</span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-700 text-base font-bold text-amber-400">
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> {submitting ? (isEditMode ? 'Updating Quotation...' : 'Generating Quotation...') : (isEditMode ? 'Save & Update Proposal' : 'Generate Proposal & Save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <QuotationFormContent />
    </Suspense>
  );
}
