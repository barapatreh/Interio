import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requisitionId = params?.id;
    const body = await request.json();
    const { status, totalPurchaseCost, invoiceUrl, purchaseNotes, purchasedAt } = body;
    // status: 'Purchased' | 'Material Sent' | 'Delivered at Site' | 'Cancelled'

    const existingReq = await prisma.materialRequisition.findUnique({
      where: { id: requisitionId },
      include: { project: true, vendor: true, items: true }
    });

    if (!existingReq) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    const billDate = purchasedAt ? new Date(purchasedAt) : new Date();

    const updatedReq = await prisma.materialRequisition.update({
      where: { id: requisitionId },
      data: {
        status,
        totalPurchaseCost: parseFloat(totalPurchaseCost || 0),
        invoiceUrl: invoiceUrl || existingReq.invoiceUrl,
        purchaseNotes: purchaseNotes || existingReq.purchaseNotes,
        purchasedAt: billDate,
        ...(status === 'Delivered at Site' || status === 'Material Sent' ? { deliveredAt: new Date() } : {})
      },
      include: { items: true, project: true, vendor: true }
    });

    // Update item statuses to match parent requisition status
    await prisma.materialRequisitionItem.updateMany({
      where: { materialRequisitionId: requisitionId },
      data: { status }
    });

    // If cost > 0, log as SiteExpense for complete payment & cost tracking
    if (parseFloat(totalPurchaseCost || 0) > 0) {
      await prisma.siteExpense.create({
        data: {
          companyId: existingReq.companyId,
          projectId: existingReq.projectId,
          title: `Material Procurement [${status}]: Req #${existingReq.requisitionNumber} (${existingReq.items.map(i => i.materialName).join(', ')})`,
          category: 'Materials',
          amount: parseFloat(totalPurchaseCost),
          expenseDate: billDate,
          recordedBy: 'Admin Procurement',
          receiptUrl: invoiceUrl || null,
          notes: purchaseNotes || `Requisition from Vendor: ${existingReq.vendor?.name || 'Site Manager'}`
        }
      });
    }

    return NextResponse.json(updatedReq);
  } catch (error) {
    console.error('Error updating requisition procurement:', error);
    return NextResponse.json({ error: 'Failed to update requisition status' }, { status: 500 });
  }
}
