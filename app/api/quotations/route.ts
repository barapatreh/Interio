import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const quotations = await prisma.quotation.findMany({
      where: {
        deletedAt: null,
        ...(companyId && companyId !== 'ALL' ? { companyId } : {})
      },
      include: {
        client: true,
        lead: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(quotations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let clientName = body.clientName;
    let clientPhone = body.clientPhone;
    let siteAddress = body.siteAddress;
    let companyId = body.companyId;

    if (!clientName && body.clientId) {
      const targetClient = await prisma.client.findUnique({
        where: { id: body.clientId }
      });
      if (targetClient) {
        clientName = targetClient.name;
        clientPhone = targetClient.phone;
        siteAddress = siteAddress || targetClient.address || targetClient.city;
        companyId = companyId || targetClient.companyId;
      }
    }

    if (!clientName && body.leadId) {
      const targetLead = await prisma.lead.findUnique({
        where: { id: body.leadId }
      });
      if (targetLead) {
        clientName = targetLead.name;
        clientPhone = targetLead.phone;
        siteAddress = siteAddress || targetLead.location;
        companyId = companyId || targetLead.companyId;
      }
    }

    if (!companyId) {
      const firstComp = await prisma.company.findFirst({ where: { deletedAt: null } });
      companyId = firstComp?.id;
    }

    const count = await prisma.quotation.count();
    const quoteNumber = body.quoteNumber || `QT-2026-${String(count + 1).padStart(3, '0')}`;

    const quotation = await prisma.quotation.create({
      data: {
        companyId,
        quoteNumber,
        clientId: body.clientId || null,
        leadId: body.leadId || null,
        clientName: clientName || 'Client / Lead',
        clientPhone,
        siteAddress,
        status: body.status || 'Draft',
        subtotal: parseFloat(body.subtotal || 0),
        discountAmount: parseFloat(body.discountAmount || 0),
        taxRate: parseFloat(body.taxRate || 18),
        taxAmount: parseFloat(body.taxAmount || 0),
        grandTotal: parseFloat(body.grandTotal || 0),
        validityDays: parseInt(body.validityDays || 30),
        terms: body.terms,
        requirementNotes: body.requirementNotes || null,
        items: {
          create: body.items?.map((item: any) => ({
            room: item.room || 'General',
            category: item.category || 'General',
            title: item.title,
            description: item.description,
            quantity: parseFloat(item.quantity || 1),
            unit: item.unit || 'sq.ft',
            unitRate: parseFloat(item.unitRate || 0),
            totalAmount: parseFloat(item.quantity || 1) * parseFloat(item.unitRate || 0)
          })) || []
        }
      },
      include: { items: true }
    });

    if (body.leadId) {
      await prisma.lead.update({
        where: { id: body.leadId },
        data: { status: 'Proposal Sent' }
      });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing quotation id or status' }, { status: 400 });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status }
    });

    // If status is updated to Converted or Converted to Project, auto-create Fitout Project if missing!
    if (status === 'Converted' || status === 'Converted to Project') {
      const existingProject = await prisma.project.findFirst({
        where: { quotationId: id, deletedAt: null }
      });

      if (!existingProject) {
        let clientId = updated.clientId;
        if (!clientId) {
          let client = await prisma.client.findFirst({
            where: { name: updated.clientName, deletedAt: null }
          });
          if (!client) {
            const clientCount = await prisma.client.count();
            const clientNumber = `CL-2026-${String(clientCount + 101).padStart(3, '0')}`;
            client = await prisma.client.create({
              data: {
                companyId: updated.companyId,
                clientNumber,
                name: updated.clientName || 'Client',
                phone: updated.clientPhone || '9876543210',
                address: updated.siteAddress || 'Site Location TBD',
                city: 'Mumbai',
                status: 'Active'
              }
            });
          }
          clientId = client.id;
          await prisma.quotation.update({ where: { id }, data: { clientId } });
        }

        let companyId = updated.companyId;
        if (!companyId) {
          const firstComp = await prisma.company.findFirst({ where: { deletedAt: null } });
          companyId = firstComp?.id;
        }

        const count = await prisma.project.count();
        const projectNumber = `PRJ-2026-${String(count + 101).padStart(3, '0')}`;

        await prisma.project.create({
          data: {
            companyId,
            projectNumber,
            clientId,
            quotationId: updated.id,
            title: `${updated.clientName} Residence - Turnkey Fitout`,
            siteAddress: updated.siteAddress || 'Site Location TBD',
            startDate: new Date(),
            status: 'Planning',
            budget: updated.grandTotal,
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
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating quotation status:', error);
    return NextResponse.json({ error: 'Failed to update quotation status' }, { status: 500 });
  }
}
