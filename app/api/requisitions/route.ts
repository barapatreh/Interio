import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveBase64File } from '@/lib/uploadHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const vendorId = searchParams.get('vendorId');
    const projectId = searchParams.get('projectId');

    const requisitions = await prisma.materialRequisition.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
        ...(vendorId ? { vendorId } : {}),
        ...(projectId ? { projectId } : {})
      },
      include: {
        project: true,
        vendor: true,
        items: true
      },
      orderBy: { requisitionDate: 'desc' }
    });

    return NextResponse.json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    return NextResponse.json({ error: 'Failed to fetch material requisitions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, vendorId, companyId, purpose, totalPurchaseCost, attachmentUrl, requisitionDate, uploadedBy } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Missing required field: projectId' }, { status: 400 });
    }

    const count = await prisma.materialRequisition.count();
    const requisitionNumber = `REQ-2026-${String(count + 101).padStart(3, '0')}`;

    // Save base64 Data URL to local public/uploads directory if present
    const savedAttachmentUrl = attachmentUrl ? saveBase64File(attachmentUrl, 'requisition') : null;

    const requisition = await prisma.materialRequisition.create({
      data: {
        requisitionNumber,
        companyId: companyId || null,
        projectId,
        vendorId: vendorId || null,
        purpose: purpose || 'Material Slip / Requisition',
        requisitionDate: requisitionDate ? new Date(requisitionDate) : new Date(),
        totalPurchaseCost: parseFloat(totalPurchaseCost || 0),
        attachmentUrl: savedAttachmentUrl,
        uploadedBy: uploadedBy || 'Vendor',
        status: 'Requested'
      },
      include: {
        project: true,
        vendor: true
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error('Error creating material requisition:', error);
    return NextResponse.json({ error: 'Failed to create material requisition' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, purchaseNotes, totalPurchaseCost } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing requisition id' }, { status: 400 });
    }

    const updated = await prisma.materialRequisition.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(purchaseNotes ? { purchaseNotes } : {}),
        ...(totalPurchaseCost !== undefined ? { totalPurchaseCost: parseFloat(totalPurchaseCost) } : {}),
        ...(status === 'Delivered at Site' ? { deliveredAt: new Date() } : {}),
        ...(status === 'Purchased' ? { purchasedAt: new Date() } : {})
      },
      include: { project: true, vendor: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating material requisition:', error);
    return NextResponse.json({ error: 'Failed to update material requisition' }, { status: 500 });
  }
}
