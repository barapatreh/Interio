import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetId, email, password, name, companyId } = body;
    // targetType: 'CLIENT' | 'VENDOR'

    if (!email || !password || !targetType || !targetId) {
      return NextResponse.json({ error: 'Email, password, and target ID are required' }, { status: 400 });
    }

    // Check if user with this email already exists
    let existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user credentials & links
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password,
          role: targetType,
          ...(targetType === 'CLIENT' ? { clientId: targetId } : { vendorId: targetId }),
          status: 'Active'
        }
      });
      return NextResponse.json({
        success: true,
        message: `${targetType} login credentials updated successfully!`,
        user: { email: updatedUser.email, password: updatedUser.password, role: updatedUser.role }
      });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: name || (targetType === 'CLIENT' ? 'Client User' : 'Vendor Partner'),
        email,
        password,
        role: targetType,
        companyId,
        ...(targetType === 'CLIENT' ? { clientId: targetId } : { vendorId: targetId }),
        status: 'Active'
      }
    });

    return NextResponse.json({
      success: true,
      message: `${targetType} portal login account created successfully!`,
      user: { email: newUser.email, password: newUser.password, role: newUser.role }
    });
  } catch (error) {
    console.error('Error generating user credentials:', error);
    return NextResponse.json({ error: 'Failed to generate user credentials' }, { status: 500 });
  }
}
