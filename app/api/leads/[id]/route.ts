import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const body = await request.json();

    if (body.action === 'softDelete') {
      const softDeleted = await prisma.lead.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return NextResponse.json(softDeleted);
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        source: body.source,
        status: body.status,
        assignedTo: body.assignedTo,
        propertyType: body.propertyType,
        estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : undefined,
        location: body.location,
        notes: body.notes
      }
    });

    // If lead status updated to Won, ensure Client profile is automatically created!
    if (body.status === 'Won') {
      let client = await prisma.client.findFirst({
        where: { leadId: updated.id, deletedAt: null }
      });

      if (!client) {
        let companyId = updated.companyId;
        if (!companyId) {
          const firstComp = await prisma.company.findFirst({ where: { deletedAt: null } });
          companyId = firstComp?.id || null;
        }

        client = await prisma.client.create({
          data: {
            companyId,
            leadId: updated.id,
            name: updated.name,
            email: updated.email || `${updated.name.toLowerCase().replace(/\s+/g, '')}@interio.com`,
            phone: updated.phone,
            address: updated.location || 'Site Location TBD',
            city: 'Mumbai',
            propertyType: updated.propertyType || 'Residential Project',
            budget: updated.estimatedBudget || 0,
            status: 'Active',
            notes: updated.notes || `Converted from CRM lead source (${updated.source}).`
          }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true, hardDeleted: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to hard delete lead' }, { status: 500 });
  }
}
