import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.siteExpense.findMany({
      orderBy: { expenseDate: 'desc' },
      include: {
        project: { include: { client: true } }
      }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch site expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expense = await prisma.siteExpense.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        category: body.category || 'Petty Cash',
        amount: parseFloat(body.amount) || 0,
        recordedBy: body.recordedBy || 'Site Manager',
        receiptUrl: body.receiptUrl,
        notes: body.notes
      },
      include: {
        project: true
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log site expense' }, { status: 500 });
  }
}
