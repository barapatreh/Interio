import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const leads = await prisma.lead.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = await prisma.lead.create({
      data: {
        companyId: body.companyId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source || 'Manual',
        status: body.status || 'New',
        assignedTo: body.assignedTo,
        propertyType: body.propertyType,
        estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : undefined,
        location: body.location || 'Mumbai',
        notes: body.notes
      }
    });

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
