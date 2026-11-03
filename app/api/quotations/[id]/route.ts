import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        client: true,
        lead: true,
        items: true,
        projects: true
      }
    });

    if (!quotation) {
      quotation = await prisma.quotation.findUnique({
        where: { quoteNumber: id },
        include: {
          client: true,
          lead: true,
          items: true,
          projects: true
        }
      });
    }

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    let existingQuote = await prisma.quotation.findUnique({ where: { id } });
    if (!existingQuote) {
      existingQuote = await prisma.quotation.findUnique({ where: { quoteNumber: id } });
    }
    if (!existingQuote) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const targetId = existingQuote.id;

    // Use transaction to update quotation and replace quotation items if provided
    const updatedQuote = await prisma.$transaction(async (tx) => {
      if (body.items && Array.isArray(body.items)) {
        await tx.quotationItem.deleteMany({
          where: { quotationId: targetId }
        });

        if (body.items.length > 0) {
          await tx.quotationItem.createMany({
            data: body.items.map((item: any) => ({
              quotationId: targetId,
              room: item.room || 'General',
              category: item.category || 'General',
              title: item.title,
              description: item.description,
              quantity: parseFloat(item.quantity || 1),
              unit: item.unit || 'sq.ft',
              unitRate: parseFloat(item.unitRate || 0),
              totalAmount: parseFloat(item.quantity || 1) * parseFloat(item.unitRate || 0)
            }))
          });
        }
      }

      const updated = await tx.quotation.update({
        where: { id: targetId },
        data: {
          ...(body.clientId !== undefined ? { clientId: body.clientId } : {}),
          ...(body.leadId !== undefined ? { leadId: body.leadId } : {}),
          ...(body.clientName ? { clientName: body.clientName } : {}),
          ...(body.clientPhone !== undefined ? { clientPhone: body.clientPhone } : {}),
          ...(body.siteAddress !== undefined ? { siteAddress: body.siteAddress } : {}),
          ...(body.status ? { status: body.status } : {}),
          ...(body.subtotal !== undefined ? { subtotal: parseFloat(body.subtotal) } : {}),
          ...(body.discountAmount !== undefined ? { discountAmount: parseFloat(body.discountAmount) } : {}),
          ...(body.taxRate !== undefined ? { taxRate: parseFloat(body.taxRate) } : {}),
          ...(body.taxAmount !== undefined ? { taxAmount: parseFloat(body.taxAmount) } : {}),
          ...(body.grandTotal !== undefined ? { grandTotal: parseFloat(body.grandTotal) } : {}),
          ...(body.validityDays !== undefined ? { validityDays: parseInt(body.validityDays) } : {}),
          ...(body.terms !== undefined ? { terms: body.terms } : {}),
          ...(body.requirementNotes !== undefined ? { requirementNotes: body.requirementNotes } : {})
        },
        include: {
          client: true,
          lead: true,
          items: true
        }
      });

      return updated;
    });

    // Auto convert Accepted Quotation into Project if project doesn't exist
    if ((body.status === 'Accepted' || body.status === 'Converted') && existingQuote.status !== 'Accepted' && existingQuote.status !== 'Converted') {
      const existingProject = await prisma.project.findFirst({ where: { quotationId: targetId } });
      if (!existingProject) {
        let clientId = updatedQuote.clientId;
        if (!clientId) {
          let client = await prisma.client.findFirst({
            where: { name: updatedQuote.clientName, deletedAt: null }
          });
          if (!client) {
            const clientCount = await prisma.client.count();
            const clientNumber = `CL-2026-${String(clientCount + 101).padStart(3, '0')}`;
            client = await prisma.client.create({
              data: {
                companyId: updatedQuote.companyId,
                clientNumber,
                name: updatedQuote.clientName || 'Client',
                phone: updatedQuote.clientPhone || '9876543210',
                address: updatedQuote.siteAddress || 'Site Location TBD',
                city: 'Mumbai',
                status: 'Active'
              }
            });
          }
          clientId = client.id;
          await prisma.quotation.update({ where: { id: targetId }, data: { clientId } });
        }

        const prjCount = await prisma.project.count();
        const projectNumber = `PRJ-${new Date().getFullYear()}-${String(prjCount + 101).padStart(3, '0')}`;

        await prisma.project.create({
          data: {
            projectNumber,
            clientId,
            quotationId: targetId,
            title: `${updatedQuote.clientName} Residence Interior Fitout`,
            siteAddress: updatedQuote.siteAddress || 'Site Address TBD',
            status: 'Planning',
            budget: updatedQuote.grandTotal,
            progressPercentage: 0,
            milestones: {
              create: [
                { title: 'Site Inspection & Demolition', order: 1, status: 'Pending' },
                { title: 'Electrical & Ceiling Framing', order: 2, status: 'Pending' },
                { title: 'Woodwork Carcass Assembly', order: 3, status: 'Pending' },
                { title: 'Painting & Finishing Works', order: 4, status: 'Pending' },
                { title: 'Final Handover', order: 5, status: 'Pending' },
              ]
            }
          }
        });
      }
    }

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      existing = await prisma.quotation.findUnique({ where: { quoteNumber: id } });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    await prisma.quotation.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
  }
}
