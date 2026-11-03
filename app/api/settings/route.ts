import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: { id: 'default', companyName: 'Interio Luxury Designs' }
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await prisma.companySettings.upsert({
      where: { id: 'default' },
      update: {
        companyName: body.companyName,
        tagline: body.tagline,
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: body.address,
        gstin: body.gstin,
        pan: body.pan,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        branch: body.branch,
        quotationTerms: body.quotationTerms,
        invoiceTerms: body.invoiceTerms
      },
      create: {
        id: 'default',
        companyName: body.companyName || 'Interio Luxury Designs',
        ...body
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
