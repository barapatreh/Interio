import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        quotation: { include: { items: true } },
        milestones: { orderBy: { order: 'asc' } },
        designs: { orderBy: { uploadedAt: 'desc' } },
        vendorContracts: { include: { vendor: true } },
        invoices: { include: { payments: true } },
        payments: true,
        vendorPayments: { include: { vendor: true } },
        expenses: { orderBy: { expenseDate: 'desc' } },
        extraWorks: { orderBy: { createdDate: 'desc' } }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        status: body.status,
        progressPercentage: body.progressPercentage !== undefined ? parseInt(body.progressPercentage) : undefined,
        siteAddress: body.siteAddress,
        targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : undefined,
        actualEndDate: body.actualEndDate ? new Date(body.actualEndDate) : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
