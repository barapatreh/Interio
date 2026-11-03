import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const clients = await prisma.client.findMany({
      where: {
        deletedAt: null,
        ...(companyId && companyId !== 'ALL' ? { companyId } : {})
      },
      include: {
        company: true,
        quotations: { where: { deletedAt: null } },
        projects: {
          where: { deletedAt: null },
          include: { designs: { where: { deletedAt: null } } }
        },
        invoices: { where: { deletedAt: null } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let companyId = body.companyId;
    if (!companyId) {
      const firstComp = await prisma.company.findFirst({ where: { deletedAt: null } });
      companyId = firstComp?.id;
    }

    const client = await prisma.client.create({
      data: {
        companyId,
        leadId: body.leadId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        address: body.address,
        city: body.city,
        propertyType: body.propertyType,
        budget: body.budget ? parseFloat(body.budget) : undefined,
        notes: body.notes,
        status: body.status || 'Active'
      },
      include: { company: true }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
