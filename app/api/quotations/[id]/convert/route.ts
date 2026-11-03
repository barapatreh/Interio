import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params?.id;
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { client: true }
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation proposal not found' }, { status: 404 });
    }

    // 1. Ensure a valid Client ID exists
    let clientId = quotation.clientId;
    if (!clientId) {
      // Find or create Client
      let existingClient = await prisma.client.findFirst({
        where: {
          OR: [
            { name: quotation.clientName },
            ...(quotation.clientPhone ? [{ phone: quotation.clientPhone }] : [])
          ],
          deletedAt: null
        }
      });

      if (!existingClient) {
        const clientCount = await prisma.client.count();
        const clientNumber = `CL-2026-${String(clientCount + 101).padStart(3, '0')}`;
        existingClient = await prisma.client.create({
          data: {
            companyId: quotation.companyId,
            name: quotation.clientName || 'Client',
            phone: quotation.clientPhone || '9876543210',
            address: quotation.siteAddress || 'Site Location TBD',
            city: 'Mumbai',
            status: 'Active'
          }
        });
      }
      clientId = existingClient.id;

      // Link client to quotation
      await prisma.quotation.update({
        where: { id: quotationId },
        data: { clientId }
      });
    }

    // Reset any previously converted quotation for this client back to 'Sent' so only ONE quotation is marked 'Converted'
    await prisma.quotation.updateMany({
      where: { clientId, status: 'Converted to Project', NOT: { id: quotationId } },
      data: { status: 'Sent' }
    });

    // 2. Update selected quotation status to Converted
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'Converted to Project' }
    });

    // 3. Resolve target companyId
    let companyId = quotation.companyId || quotation.client?.companyId;
    if (!companyId) {
      const fallbackCompany = await prisma.company.findFirst({ where: { deletedAt: null } });
      companyId = fallbackCompany?.id;
    }

    // 4. Check if project already exists for this quotation OR for this client
    let project = await prisma.project.findFirst({
      where: { quotationId, deletedAt: null }
    });

    if (!project && clientId) {
      project = await prisma.project.findFirst({
        where: { clientId, deletedAt: null }
      });
    }

    if (project) {
      // Update existing client project to use this selected quotation's budget & details!
      project = await prisma.project.update({
        where: { id: project.id },
        data: {
          quotationId: quotation.id,
          budget: quotation.grandTotal,
          siteAddress: quotation.siteAddress || project.siteAddress,
          title: `${quotation.clientName} Turnkey Fitout (${quotation.quoteNumber})`
        },
        include: { client: true, company: true, milestones: true }
      });
    } else {
      const count = await prisma.project.count();
      const projectNumber = `PRJ-2026-${String(count + 101).padStart(3, '0')}`;

      project = await prisma.project.create({
        data: {
          companyId,
          projectNumber,
          clientId,
          quotationId: quotation.id,
          title: `${quotation.clientName} Turnkey Fitout (${quotation.quoteNumber})`,
          siteAddress: quotation.siteAddress || quotation.client?.address || 'Site Location TBD',
          startDate: new Date(),
          status: 'Planning',
          budget: quotation.grandTotal,
          progressPercentage: 10,
          milestones: {
            create: [
              { title: 'Site Marking & Demolition', description: 'Wall dismantling & plumbing floor routing', status: 'In Progress', order: 1 },
              { title: 'Electrical & POP Ceiling Framing', description: 'Concealed wiring & Gypsum framing', status: 'Pending', order: 2 },
              { title: 'Carpentry & Carcass Production', description: 'Modular box assembly & carcass installation', status: 'Pending', order: 3 },
              { title: 'Painting, Laminates & Polish', description: 'Veneer polish, acrylic laminate & 2 coats paint', status: 'Pending', order: 4 },
              { title: 'Final Cleaning & Handover', description: 'Deep cleaning, snag list rectification & handover', status: 'Pending', order: 5 }
            ]
          }
        },
        include: { client: true, company: true, milestones: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotation.quoteNumber} (₹${quotation.grandTotal.toLocaleString('en-IN')}) selected and converted to active fitout project!`,
      project
    });
  } catch (error) {
    console.error('Error converting quotation to project:', error);
    return NextResponse.json({ error: 'Failed to convert quotation to project' }, { status: 500 });
  }
}
