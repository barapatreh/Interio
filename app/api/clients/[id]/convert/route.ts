import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params?.id;
    const body = await request.json().catch(() => ({}));

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client || client.deletedAt) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // Determine target companyId
    let companyId = body.companyId || client.companyId;
    if (!companyId) {
      const fallbackCompany = await prisma.company.findFirst({ where: { deletedAt: null } });
      companyId = fallbackCompany?.id;
    }

    // Check if project already exists for this client with the same title
    const count = await prisma.project.count();
    const projectNumber = `PRJ-2026-${String(count + 101).padStart(3, '0')}`;

    const projectTitle = body.title || `${client.name} Fitout Project`;
    const siteAddress = body.siteAddress || client.address || client.city || 'Site Address TBD';
    const projectBudget = body.budget ? parseFloat(body.budget) : (client.budget || 0);

    const project = await prisma.project.create({
      data: {
        companyId,
        clientId: client.id,
        projectNumber,
        title: projectTitle,
        siteAddress,
        startDate: new Date(),
        status: 'Planning',
        budget: projectBudget,
        progressPercentage: 10,
        milestones: {
          create: [
            { title: 'Site Marking & Demolition', description: 'Wall dismantling & plumbing floor routing', status: 'In Progress', order: 1 },
            { title: 'Electrical & POP Ceiling Framing', description: 'Concealed wiring & Gypsum framing', status: 'Pending', order: 2 },
            { title: 'Carpentry & Carcass Production', description: 'Modular box assembly & carcass installation', status: 'Pending', order: 3 },
            { title: 'Painting, Laminates & Polish', description: 'Veneer polish, acrylic laminate & 2 coats paint', status: 'Pending', order: 4 },
            { title: 'Final Cleaning & Handover', description: 'Deep cleaning, snag list rectification & handover', status: 'Pending', order: 5 }
          ]
        }
      },
      include: {
        client: true,
        company: true,
        milestones: true
      }
    });

    // Update Client status to Active
    await prisma.client.update({
      where: { id: client.id },
      data: { status: 'Active' }
    });

    return NextResponse.json({
      success: true,
      message: `Client ${client.name} successfully converted to Fitout Project (${projectNumber})`,
      project
    });
  } catch (error) {
    console.error('Error converting client to project:', error);
    return NextResponse.json({ error: 'Failed to convert client to fitout project' }, { status: 500 });
  }
}
