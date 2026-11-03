import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await prisma.company.count();
    const code = body.code || `INT-${String(count + 1).padStart(3, '0')}`;

    const company = await prisma.company.create({
      data: {
        name: body.name,
        code,
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
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
