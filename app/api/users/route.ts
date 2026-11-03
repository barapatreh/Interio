import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(companyId ? { companyId } : {})
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: {
        companyId: body.companyId,
        name: body.name,
        email: body.email,
        password: body.password || 'interio123',
        role: body.role || 'ADMIN',
        status: 'Active'
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
