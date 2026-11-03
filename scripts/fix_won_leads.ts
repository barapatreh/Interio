import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWonLeads() {
  console.log('Scanning for Won leads missing Client entries on cloud database...');

  const wonLeads = await prisma.lead.findMany({
    where: {
      status: 'Won',
      deletedAt: null
    }
  });

  console.log(`Found ${wonLeads.length} lead(s) in Won status.`);

  for (const lead of wonLeads) {
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [
          { leadId: lead.id },
          { name: lead.name },
          ...(lead.phone ? [{ phone: lead.phone }] : [])
        ],
        deletedAt: null
      }
    });

    if (existingClient) {
      console.log(`Lead "${lead.name}" already has client profile (${existingClient.id}).`);
      continue;
    }

    console.log(`Creating missing Client profile for lead "${lead.name}"...`);

    let companyId: string | null = lead.companyId;
    if (!companyId) {
      const firstComp = await prisma.company.findFirst({ where: { deletedAt: null } });
      companyId = firstComp?.id || null;
    }

    const newClient = await prisma.client.create({
      data: {
        companyId,
        leadId: lead.id,
        name: lead.name,
        email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '')}@interio.com`,
        phone: lead.phone,
        address: lead.location || 'Site Location TBD',
        city: 'Mumbai',
        propertyType: lead.propertyType || 'Residential Client',
        budget: lead.estimatedBudget || 0,
        status: 'Active',
        notes: lead.notes || `Converted from CRM lead (${lead.source}).`
      }
    });

    console.log(`SUCCESS: Created Client profile ${newClient.id} for "${lead.name}"!`);
  }
}

fixWonLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
