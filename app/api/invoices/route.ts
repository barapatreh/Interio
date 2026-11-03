import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const invoices = await prisma.clientInvoice.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      orderBy: { issuedDate: 'desc' },
      include: {
        project: true,
        client: true,
        payments: true
      }
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === 'payment') {
      // Record a client payment entry
      const { companyId, invoiceId, projectId, clientId, amountPaid, paymentMode, transactionRef, proofUrl } = body;
      const count = await prisma.clientPayment.count();
      const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      const payment = await prisma.clientPayment.create({
        data: {
          companyId: companyId || null,
          invoiceId: invoiceId || null,
          projectId,
          clientId,
          amountPaid: parseFloat(amountPaid),
          paymentMode: paymentMode || 'Bank Transfer',
          transactionRef,
          proofUrl,
          receiptNumber
        }
      });

      // If tied to an invoice, check if invoice is fully paid
      if (invoiceId) {
        const inv = await prisma.clientInvoice.findUnique({
          where: { id: invoiceId },
          include: { payments: true }
        });
        if (inv) {
          const totalPaid = inv.payments.reduce((acc, p) => acc + p.amountPaid, 0);
          const newStatus = totalPaid >= inv.totalAmount ? 'Paid' : 'Partial';
          await prisma.clientInvoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
          });
        }
      }

      return NextResponse.json(payment);
    }

    // Generate Invoice
    const count = await prisma.clientInvoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const amount = parseFloat(body.amount) || 0;
    const taxAmount = parseFloat(body.taxAmount) || (amount * 0.18);
    const totalAmount = amount + taxAmount;

    const invoice = await prisma.clientInvoice.create({
      data: {
        invoiceNumber,
        companyId: body.companyId || null,
        projectId: body.projectId,
        clientId: body.clientId,
        milestoneName: body.milestoneName || 'Progress Milestone',
        amount,
        taxAmount,
        totalAmount,
        status: body.status || 'Issued',
        issuedDate: body.issuedDate ? new Date(body.issuedDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes
      },
      include: {
        project: true,
        client: true
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error in invoices route:', error);
    return NextResponse.json({ error: 'Failed to process invoice request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, paymentMode, transactionRef, amountPaid, reminderStatus, reminderMessage } = body;

    const updated = await prisma.clientInvoice.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(reminderStatus ? { reminderStatus, lastReminderSentAt: new Date() } : {}),
        ...(reminderMessage ? { reminderMessage } : {})
      },
      include: { project: true, client: true, payments: true }
    });

    if (status === 'Paid') {
      const count = await prisma.clientPayment.count();
      const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
      await prisma.clientPayment.create({
        data: {
          companyId: updated.companyId,
          invoiceId: updated.id,
          projectId: updated.projectId,
          clientId: updated.clientId,
          amountPaid: (amountPaid !== undefined && amountPaid !== null && !isNaN(parseFloat(amountPaid)))
            ? parseFloat(amountPaid)
            : (updated.totalAmount || updated.amount || 0),
          paymentMode: paymentMode || 'Bank Transfer',
          transactionRef: transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
          receiptNumber
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
