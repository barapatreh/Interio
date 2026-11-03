import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(companyId && companyId !== 'ALL' ? { companyId } : {})
      },
      include: {
        client: true,
        company: true,
        milestones: true,
        extraWorks: { where: { deletedAt: null } },
        designs: { where: { deletedAt: null } },
        vendorContracts: { include: { vendor: true } },
        invoices: { where: { deletedAt: null } },
        vendorPayments: { where: { deletedAt: null } },
        expenses: { where: { deletedAt: null } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await prisma.project.count();
    const projectNumber = body.projectNumber || `PRJ-2026-${String(count + 101).padStart(3, '0')}`;

    let targetCompanyId = body.companyId;
    if (!targetCompanyId && body.clientId) {
      const client = await prisma.client.findUnique({ where: { id: body.clientId } });
      targetCompanyId = client?.companyId;
    }
    if (!targetCompanyId) {
      const fallbackCompany = await prisma.company.findFirst({ where: { deletedAt: null } });
      targetCompanyId = fallbackCompany?.id;
    }

    const project = await prisma.project.create({
      data: {
        companyId: targetCompanyId,
        projectNumber,
        clientId: body.clientId,
        quotationId: body.quotationId,
        title: body.title,
        siteAddress: body.siteAddress,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : undefined,
        status: body.status || 'Planning',
        budget: parseFloat(body.budget || 0),
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
      include: { client: true, company: true, milestones: true }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
