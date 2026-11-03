import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Multi-Company & Role-Based Interio Platform...');

  // Clear previous records cleanly in correct foreign-key reverse order
  await prisma.extraWork.deleteMany().catch(() => {});
  await prisma.siteExpense.deleteMany().catch(() => {});
  await prisma.vendorPayment.deleteMany().catch(() => {});
  await prisma.clientPayment.deleteMany().catch(() => {});
  await prisma.clientInvoice.deleteMany().catch(() => {});
  await prisma.vendorContract.deleteMany().catch(() => {});
  await prisma.design.deleteMany().catch(() => {});
  await prisma.projectMilestone.deleteMany().catch(() => {});
  await prisma.project.deleteMany().catch(() => {});
  await prisma.quotationItem.deleteMany().catch(() => {});
  await prisma.quotation.deleteMany().catch(() => {});
  await prisma.serviceCatalogue.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
  await prisma.vendor.deleteMany().catch(() => {});
  await prisma.client.deleteMany().catch(() => {});
  await prisma.lead.deleteMany().catch(() => {});
  await prisma.company.deleteMany().catch(() => {});

  // 1. Create Companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Interio Luxury Fitouts & Residential',
      code: 'INT-LUX',
      tagline: 'Premium Turnkey High-End Residential Interiors',
      phone: '+91 98200 12345',
      email: 'lux@interiodesigns.com',
      website: 'www.interioluxury.com',
      address: 'Suite 402, Design Heights, BKC Financial District, Mumbai 400051',
      gstin: '27AAAAA1234A1Z5',
      pan: 'AAAAA1234A',
      bankName: 'HDFC Bank Ltd.',
      accountNumber: '50200098765432',
      ifscCode: 'HDFC0000123',
      branch: 'BKC Branch, Mumbai',
      quotationTerms: '1. Booking Advance: 10%\n2. Design Approval & Production: 40%\n3. Material Delivery to Site: 40%\n4. Final Inspection & Handover: 10%\n5. Proposal valid for 30 days.',
      invoiceTerms: '1. Payment due within 7 days of invoice date.\n2. Delayed payments subject to 18% p.a. interest.'
    }
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Interio Commercial Studio & Turnkey',
      code: 'INT-COM',
      tagline: 'Architectural Commercial Interiors & Office Fitouts',
      phone: '+91 98200 99887',
      email: 'commercial@interiodesigns.com',
      website: 'www.interiocommercial.com',
      address: 'Floor 12, Tower 3, Mindspace IT Park, Airoli, Navi Mumbai 400708',
      gstin: '27BBBBB5678B1Z9',
      pan: 'BBBBB5678B',
      bankName: 'ICICI Bank Ltd.',
      accountNumber: '001105009988',
      ifscCode: 'ICIC0000011',
      branch: 'Nariman Point, Mumbai',
      quotationTerms: '1. Mobilization Advance: 20%\n2. Site Civil Work & MEP: 40%\n3. Fitout Completion & Handover: 40%\n4. Proposal valid for 45 days.',
      invoiceTerms: '1. Payment due within 15 days of invoice date.\n2. GST extra as applicable.'
    }
  });

  // 2. Service Catalogue (Company 1)
  const catalogueItems = [
    { companyId: company1.id, category: 'Modular Kitchen', title: 'Acrylic Finish Modular Kitchen', description: 'BWP Marine Plywood boxes with 1.5mm High Gloss Acrylic Shutters, Tandem Drawers & Soft Close Hettich Hardware', unit: 'sq.ft', defaultPrice: 1850 },
    { companyId: company1.id, category: 'Modular Kitchen', title: 'Quartz Stone Kitchen Countertop', description: '15mm Premium Quartz stone with edge chamfering & sink cutout', unit: 'r.ft', defaultPrice: 650 },
    { companyId: company1.id, category: 'Wardrobes', title: 'Floor-to-Ceiling Sliding Wardrobe', description: 'Commercial Ply with Anti-fingerprint Matte Laminate & Soft Close Slider mechanism', unit: 'sq.ft', defaultPrice: 1650 },
    { companyId: company1.id, category: 'False Ceiling', title: 'Gypsum Board False Ceiling', description: 'Saint Gobain Gypsum Board ceiling with perimeter cove lighting detail & cutouts', unit: 'sq.ft', defaultPrice: 145 },
    { companyId: company1.id, category: 'Electrical', title: 'Point Wiring & Architectural Lighting', description: 'Havells / Polycab FRLS concealed copper wiring, modular switches & magnetic track lights', unit: 'lump sum', defaultPrice: 85000 },
    { companyId: company1.id, category: 'Painting', title: 'Royale Luxury Emulsion Painting', description: '2 Coats Asian Paints Royale Emulsion over 2 coats acrylic putty & primer base', unit: 'sq.ft', defaultPrice: 42 }
  ];

  for (const item of catalogueItems) {
    await prisma.serviceCatalogue.create({ data: item });
  }

  // 3. CRM Leads (Company 1)
  const lead1 = await prisma.lead.create({
    data: {
      companyId: company1.id,
      name: 'Rajesh & Simran Malhotra',
      email: 'rajesh.malhotra@gmail.com',
      phone: '+91 98191 22334',
      source: 'Meta Ads',
      status: 'Won',
      assignedTo: 'Vikram Mehta (Design Director)',
      propertyType: '3BHK Apartment',
      estimatedBudget: 3500000,
      location: 'Wadhwa Wise City, Panvel',
      notes: 'Wants modern warm minimal aesthetic. High priority kitchen & master bedroom.'
    }
  });

  // 4. Clients (Company 1)
  const client1 = await prisma.client.create({
    data: {
      companyId: company1.id,
      leadId: lead1.id,
      name: 'Rajesh Malhotra',
      email: 'client@interio.com',
      phone: '+91 98191 22334',
      alternatePhone: '+91 98191 22335',
      address: 'Flat 1802, Tower A, Wadhwa Wise City',
      city: 'Mumbai',
      propertyType: '3BHK Apartment (1,450 sq.ft)',
      budget: 3500000,
      status: 'Active',
      notes: 'Client prefers warm wooden tones with gold brass accents. All woodwork in marine ply.'
    }
  });

  // 5. Vendor
  const vendor1 = await prisma.vendor.create({
    data: {
      companyId: company1.id,
      name: 'Ramesh Carpenter & Associates',
      companyName: 'Star Woodcrafts',
      trade: 'Carpentry',
      phone: '+91 98201 55667',
      email: 'vendor@interio.com',
      status: 'Active'
    }
  });

  // 6. Users (Staff, Client, Vendor)
  const usersToCreate = [
    { companyId: company1.id, name: 'Master Admin (Hemant)', email: 'admin@interio.com', password: 'admin123', role: 'MASTER_ADMIN', status: 'Active' },
    { companyId: company1.id, name: 'Vikram Mehta', email: 'sales@interio.com', password: 'sales123', role: 'SALES', status: 'Active' },
    { companyId: company1.id, name: 'Neha Kapoor', email: 'designer@interio.com', password: 'design123', role: 'DESIGNER', status: 'Active' },
    { companyId: company1.id, name: 'Rohan Deshmukh', email: 'pm@interio.com', password: 'pm123', role: 'PROJECT_MANAGER', status: 'Active' },
    { companyId: company1.id, name: 'Sanjay Shah', email: 'accounts@interio.com', password: 'accounts123', role: 'ACCOUNTANT', status: 'Active' },
    { companyId: company1.id, clientId: client1.id, name: 'Rajesh Malhotra (Client)', email: 'client@interio.com', password: 'client123', role: 'CLIENT', status: 'Active' },
    { companyId: company1.id, vendorId: vendor1.id, name: 'Ramesh Carpenter (Vendor)', email: 'vendor@interio.com', password: 'vendor123', role: 'VENDOR', status: 'Active' }
  ];

  for (const u of usersToCreate) {
    await prisma.user.create({ data: u });
  }

  // 7. Quotation (Company 1)
  const quotation1 = await prisma.quotation.create({
    data: {
      companyId: company1.id,
      clientId: client1.id,
      quoteNumber: 'QT-2026-001',
      clientName: client1.name,
      clientPhone: client1.phone,
      siteAddress: client1.address,
      status: 'Approved',
      subtotal: 1850000,
      discountAmount: 50000,
      taxRate: 18,
      taxAmount: 324000,
      grandTotal: 2124000,
      validityDays: 30,
      terms: 'Payment schedule: 10% booking, 40% production, 40% site delivery, 10% handover.',
      items: {
        create: [
          { room: 'Living Room', category: 'False Ceiling', title: 'Gypsum Board Ceiling', description: 'Perimeter cove detail with LED strips', quantity: 450, unit: 'sq.ft', unitRate: 145, totalAmount: 65250 },
          { room: 'Kitchen', category: 'Modular Kitchen', title: 'Acrylic Modular Kitchen', description: 'Marine Ply + Hettich hardware', quantity: 180, unit: 'sq.ft', unitRate: 1850, totalAmount: 333000 }
        ]
      }
    }
  });

  // 8. Project (Company 1)
  const project1 = await prisma.project.create({
    data: {
      companyId: company1.id,
      quotationId: quotation1.id,
      clientId: client1.id,
      projectNumber: 'PRJ-2026-001',
      title: 'Malhotra 3BHK Turnkey Interior Fitout',
      siteAddress: 'Flat 1802, Wadhwa Wise City, Panvel',
      startDate: new Date(),
      targetEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progressPercentage: 35,
      budget: 2124000
    }
  });

  // 9. Milestones
  await prisma.projectMilestone.createMany({
    data: [
      { projectId: project1.id, title: 'Site Measurement & CAD Approval', status: 'Completed', dueDate: new Date() },
      { projectId: project1.id, title: 'Electrical Wiring & Plumbing Rough-in', status: 'In Progress', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { projectId: project1.id, title: 'False Ceiling & Framing', status: 'Pending', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) }
    ]
  });

  console.log('Seeding completed cleanly on Cloud Database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
