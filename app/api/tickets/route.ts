import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const companyId = searchParams.get('companyId');

    const tickets = await prisma.ticket.findMany({
      where: {
        deletedAt: null,
        ...(clientId ? { clientId } : {}),
        ...(companyId ? { companyId } : {})
      },
      include: {
        client: true,
        project: true
      },
      orderBy: { createdDate: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await prisma.ticket.count();
    const ticketNumber = `TCK-${new Date().getFullYear()}-${String(count + 101).padStart(3, '0')}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        companyId: body.companyId || null,
        clientId: body.clientId,
        projectId: body.projectId || null,
        category: body.category || 'Fitout Snag',
        subject: body.subject,
        description: body.description,
        priority: body.priority || 'Medium',
        status: 'Open'
      },
      include: {
        client: true,
        project: true
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(status === 'Resolved' || status === 'Closed' ? { resolvedAt: new Date() } : {})
      },
      include: { client: true, project: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
