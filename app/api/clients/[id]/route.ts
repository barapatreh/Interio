import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        quotations: { where: { deletedAt: null }, include: { items: true } },
        projects: {
          where: { deletedAt: null },
          include: {
            milestones: true,
            designs: { where: { deletedAt: null } },
            invoices: { where: { deletedAt: null } },
            expenses: { where: { deletedAt: null } },
            extraWorks: { where: { deletedAt: null } }
          }
        },
        invoices: { where: { deletedAt: null }, include: { payments: true } },
        payments: { where: { deletedAt: null } }
      }
    });

    if (!client || client.deletedAt) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const body = await request.json();

    if (body.action === 'softDelete') {
      const softDeleted = await prisma.client.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return NextResponse.json(softDeleted);
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        address: body.address,
        city: body.city,
        propertyType: body.propertyType,
        budget: body.budget ? parseFloat(body.budget) : undefined,
        notes: body.notes,
        status: body.status
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true, hardDeleted: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to hard delete client' }, { status: 500 });
  }
}
