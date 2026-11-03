import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const projectId = searchParams.get('projectId');

    const events = await prisma.workEvent.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
        ...(projectId ? { projectId } : {})
      },
      include: {
        project: true
      },
      orderBy: { eventDate: 'asc' }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching work events:', error);
    return NextResponse.json({ error: 'Failed to fetch work calendar events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, projectId, title, eventType, eventDate, eventTime, priority, notes } = body;

    if (!title || !eventDate) {
      return NextResponse.json({ error: 'Title and Event Date are required' }, { status: 400 });
    }

    const event = await prisma.workEvent.create({
      data: {
        companyId: companyId || null,
        projectId: projectId || null,
        title,
        eventType: eventType || 'Site Work',
        eventDate: new Date(eventDate),
        eventTime: eventTime || '10:00 AM',
        priority: priority || 'Medium',
        notes: notes || null,
        status: 'Scheduled'
      },
      include: {
        project: true
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating work event:', error);
    return NextResponse.json({ error: 'Failed to create work event' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, title, eventType, eventDate, eventTime, priority, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
    }

    const updated = await prisma.workEvent.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(title ? { title } : {}),
        ...(eventType ? { eventType } : {}),
        ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
        ...(eventTime ? { eventTime } : {}),
        ...(priority ? { priority } : {}),
        ...(notes !== undefined ? { notes } : {})
      },
      include: { project: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating work event:', error);
    return NextResponse.json({ error: 'Failed to update work event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing event id' }, { status: 400 });
    }

    await prisma.workEvent.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work event:', error);
    return NextResponse.json({ error: 'Failed to delete work event' }, { status: 500 });
  }
}
