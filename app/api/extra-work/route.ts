import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const extraWorks = await prisma.extraWork.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      orderBy: { createdDate: 'desc' },
      include: {
        project: { include: { client: true } }
      }
    });
    return NextResponse.json(extraWorks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch variation orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const extraWork = await prisma.extraWork.create({
      data: {
        companyId: body.companyId || null,
        projectId: body.projectId,
        workTitle: body.workTitle,
        description: body.description,
        requestedBy: body.requestedBy || 'Client',
        estimatedCost: parseFloat(body.estimatedCost) || 0,
        approvedAmount: body.approvedAmount ? parseFloat(body.approvedAmount) : parseFloat(body.estimatedCost) || 0,
        approvalStatus: body.approvalStatus || 'Pending',
        billingAdded: body.billingAdded || false
      },
      include: {
        project: true
      }
    });
    return NextResponse.json(extraWork);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create extra work entry' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, approvalStatus, approvedAmount, billingAdded } = body;

    const current = await prisma.extraWork.findUnique({
      where: { id },
      include: { project: { include: { client: true } } }
    });

    if (!current) {
      return NextResponse.json({ error: 'Extra work record not found' }, { status: 404 });
    }

    const updatedAmount = approvedAmount !== undefined ? parseFloat(approvedAmount) : current.estimatedCost;

    const updated = await prisma.extraWork.update({
      where: { id },
      data: {
        approvalStatus,
        approvedAmount: updatedAmount,
        billingAdded: billingAdded !== undefined ? billingAdded : (approvalStatus === 'Approved')
      }
    });

    // If client/admin approves Extra Work, auto-generate Supplemental Quotation & Invoice
    if (approvalStatus === 'Approved' && !current.billingAdded) {
      const qCount = await prisma.quotation.count();
      const quoteNumber = `QT-EX-${new Date().getFullYear()}-${String(qCount + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
      const grandTotal = updatedAmount * 1.18; // 18% GST

      const newQuote = await prisma.quotation.create({
        data: {
          companyId: current.companyId || current.project?.companyId || null,
          quoteNumber,
          clientId: current.project.clientId,
          clientName: current.project.client?.name || 'Client',
          clientPhone: current.project.client?.phone || '',
          siteAddress: current.project.siteAddress,
          status: 'Accepted',
          subtotal: updatedAmount,
          taxRate: 18,
          taxAmount: updatedAmount * 0.18,
          grandTotal,
          terms: `Supplemental Quotation for Extra Scope of Work: ${current.workTitle}`,
          items: {
            create: [
              {
                room: 'Extra Scope',
                category: 'Extra Work Order',
                title: current.workTitle,
                description: current.description || 'Approved Variation Scope of Work',
                quantity: 1,
                unit: 'lump sum',
                unitRate: updatedAmount,
                totalAmount: updatedAmount
              }
            ]
          }
        }
      });

      // Auto-generate matching Invoice
      const iCount = await prisma.clientInvoice.count();
      const invoiceNumber = `INV-EX-${new Date().getFullYear()}-${String(iCount + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;

      await prisma.clientInvoice.create({
        data: {
          companyId: current.companyId || current.project?.companyId || null,
          invoiceNumber,
          projectId: current.projectId,
          clientId: current.project.clientId,
          milestoneName: `Extra Work Invoice: ${current.workTitle}`,
          amount: updatedAmount,
          taxAmount: updatedAmount * 0.18,
          totalAmount: grandTotal,
          status: 'Issued',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          notes: `Invoice generated automatically from approved Extra Work Order #${current.id}`
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating extra work:', error);
    return NextResponse.json({ error: 'Failed to update variation order' }, { status: 500 });
  }
}
