import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const item = await prisma.serviceCatalogue.update({
      where: { id: params.id },
      data: {
        category: body.category,
        title: body.title,
        description: body.description,
        unit: body.unit,
        defaultPrice: body.defaultPrice !== undefined && body.defaultPrice !== '' ? parseFloat(body.defaultPrice) : undefined,
        packageItems: body.packageItems !== undefined ? body.packageItems : undefined,
        status: body.status
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating catalogue item:', error);
    return NextResponse.json({ error: 'Failed to update catalogue item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.serviceCatalogue.update({
      where: { id: params.id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error deleting catalogue item:', error);
    return NextResponse.json({ error: 'Failed to delete catalogue item' }, { status: 500 });
  }
}
