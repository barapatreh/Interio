import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Milestone ID and status are required' }, { status: 400 });
    }

    const updated = await prisma.projectMilestone.update({
      where: { id },
      data: {
        status,
        completedDate: status === 'Completed' ? new Date() : null
      }
    });

    // Recalculate project overall progress percentage automatically
    const allMilestones = await prisma.projectMilestone.findMany({
      where: { projectId: updated.projectId }
    });

    if (allMilestones.length > 0) {
      const completedCount = allMilestones.filter((m) => m.status === 'Completed').length;
      const autoPct = Math.round((completedCount / allMilestones.length) * 100);

      await prisma.project.update({
        where: { id: updated.projectId },
        data: {
          progressPercentage: autoPct,
          status: autoPct === 100 ? 'Completed' : 'In Progress'
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update milestone status:', error);
    return NextResponse.json({ error: 'Failed to update milestone status' }, { status: 500 });
  }
}
