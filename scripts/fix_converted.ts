import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixConvertedQuotes() {
  console.log('Fixing converted quotes on cloud database...');

  const convertedQuotes = await prisma.quotation.findMany({
    where: {
      status: { in: ['Converted', 'Converted to Project', 'Accepted'] },
      deletedAt: null
    },
    include: { client: true }
  });

  console.log(`Found ${convertedQuotes.length} converted/accepted quotation(s).`);

  for (const q of convertedQuotes) {
    const existingProject = await prisma.project.findFirst({
      where: { quotationId: q.id, deletedAt: null }
    });

    if (existingProject) {
      console.log(`Quote ${q.quoteNumber} already has project ${existingProject.projectNumber}`);
      continue;
    }

    console.log(`Creating missing project for quote ${q.quoteNumber} (Client: ${q.clientName})...`);

    let clientId = q.clientId;
    if (!clientId) {
      let client = await prisma.client.findFirst({
        where: { name: q.clientName, deletedAt: null }
      });
      if (!client) {
        client = await prisma.client.create({
          data: {
            companyId: q.companyId,
            name: q.clientName || 'Client',
            phone: q.clientPhone || '9876543210',
            address: q.siteAddress || 'Site Location TBD',
            city: 'Mumbai',
            status: 'Active'
          }
        });
      }
      clientId = client.id;
      await prisma.quotation.update({ where: { id: q.id }, data: { clientId } });
    }

    let companyId: string | null = q.companyId;
    if (!companyId) {
      const firstComp = await prisma.company.findFirst({ where: { deletedAt: null } });
      companyId = firstComp?.id || null;
    }

    const count = await prisma.project.count();
    const projectNumber = `PRJ-2026-${String(count + 101).padStart(3, '0')}`;

    const newProj = await prisma.project.create({
      data: {
        companyId,
        projectNumber,
        clientId,
        quotationId: q.id,
        title: `${q.clientName} Turnkey Fitout Project`,
        siteAddress: q.siteAddress || 'Site Location TBD',
        startDate: new Date(),
        status: 'In Progress',
        budget: q.grandTotal,
        progressPercentage: 25,
        milestones: {
          create: [
            { title: 'Site Marking & Demolition', description: 'Wall dismantling & plumbing floor routing', status: 'Completed', order: 1 },
            { title: 'Electrical & POP Ceiling Framing', description: 'Concealed wiring & Gypsum framing', status: 'In Progress', order: 2 },
            { title: 'Carpentry & Carcass Production', description: 'Modular box assembly & carcass installation', status: 'Pending', order: 3 },
            { title: 'Painting, Laminates & Polish', description: 'Veneer polish, acrylic laminate & 2 coats paint', status: 'Pending', order: 4 },
            { title: 'Final Cleaning & Handover', description: 'Deep cleaning, snag list rectification & handover', status: 'Pending', order: 5 }
          ]
        }
      }
    });

    console.log(`SUCCESS: Created project ${newProj.projectNumber} (${newProj.title}) for quote ${q.quoteNumber}!`);
  }
}

fixConvertedQuotes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
