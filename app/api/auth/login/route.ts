import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        email: email?.trim().toLowerCase(),
        deletedAt: null
      },
      include: {
        company: true
      }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name || 'All Companies'
      },
      companies
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Server authentication failure' }, { status: 500 });
  }
}
