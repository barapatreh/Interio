import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const payments = await prisma.vendorPayment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        vendor: true,
        project: { include: { client: true } }
      }
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendor payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = await prisma.vendorPayment.create({
      data: {
        vendorId: body.vendorId,
        projectId: body.projectId,
        amount: parseFloat(body.amount) || 0,
        paymentMode: body.paymentMode || 'Bank Transfer',
        category: body.category || 'Labour',
        notes: body.notes,
        transactionRef: body.transactionRef
      },
      include: {
        vendor: true,
        project: true
      }
    });
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record vendor payment' }, { status: 500 });
  }
}
