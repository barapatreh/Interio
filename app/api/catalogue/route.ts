import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const whereClause: any = { deletedAt: null };
    if (companyId) {
      whereClause.OR = [
        { companyId },
        { companyId: null }
      ];
    }

    const items = await prisma.serviceCatalogue.findMany({
      where: whereClause,
      orderBy: { category: 'asc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch service catalogue' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.serviceCatalogue.create({
      data: {
        companyId: body.companyId,
        category: body.category,
        title: body.title,
        description: body.description,
        unit: body.unit || 'sq.ft',
        defaultPrice: body.defaultPrice !== undefined && body.defaultPrice !== '' ? parseFloat(body.defaultPrice) : 0,
        packageItems: body.packageItems || null,
        status: body.status || 'Active'
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add catalogue item' }, { status: 500 });
  }
}
