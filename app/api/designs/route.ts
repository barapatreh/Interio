import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveBase64File } from '@/lib/uploadHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const companyId = searchParams.get('companyId');

    const designs = await prisma.design.findMany({
      where: {
        deletedAt: null,
        ...(projectId ? { projectId } : {}),
        ...(companyId ? { project: { companyId } } : {})
      },
      include: {
        project: {
          include: { client: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json(designs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch design assets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, title, room, type, fileUrl, version } = body;

    if (!projectId || !title || !fileUrl) {
      return NextResponse.json({ error: 'Project, Title, and File URL / Asset are required' }, { status: 400 });
    }

    // Save base64 Data URL to local public/uploads directory if present
    const savedFileUrl = saveBase64File(fileUrl, 'design');

    const design = await prisma.design.create({
      data: {
        projectId,
        title: title || 'Design Render / Asset',
        type: type || (savedFileUrl.endsWith('.pdf') ? '2D CAD Drawing PDF' : '3D Render Image'),
        fileUrl: savedFileUrl,
        version: version || 'v1.0',
        approvalStatus: 'Pending'
      },
      include: {
        project: {
          include: { client: true }
        }
      }
    });

    return NextResponse.json(design);
  } catch (error) {
    console.error('Error uploading design asset:', error);
    return NextResponse.json({ error: 'Failed to upload design asset' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, clientFeedback } = body;

    const design = await prisma.design.update({
      where: { id },
      data: {
        approvalStatus: status || 'Approved',
        clientFeedback: clientFeedback || null
      }
    });

    return NextResponse.json(design);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update design approval status' }, { status: 500 });
  }
}
