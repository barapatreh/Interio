import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const vendors = await prisma.vendor.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      include: {
        contracts: { include: { project: true } },
        payments: { where: { deletedAt: null } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vendors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vendor = await prisma.vendor.create({
      data: {
        companyId: body.companyId,
        name: body.name,
        companyName: body.companyName,
        trade: body.trade,
        phone: body.phone,
        email: body.email,
        gstin: body.gstin,
        status: body.status || 'Active'
      }
    });

    return NextResponse.json(vendor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
