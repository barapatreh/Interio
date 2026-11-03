import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.code !== undefined && body.code !== '') dataToUpdate.code = body.code;
    if (body.tagline !== undefined) dataToUpdate.tagline = body.tagline;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone;
    if (body.email !== undefined) dataToUpdate.email = body.email;
    if (body.website !== undefined) dataToUpdate.website = body.website;
    if (body.address !== undefined) dataToUpdate.address = body.address;
    if (body.logoUrl !== undefined) dataToUpdate.logoUrl = body.logoUrl;
    if (body.letterheadUrl !== undefined) dataToUpdate.letterheadUrl = body.letterheadUrl;
    if (body.gstin !== undefined) dataToUpdate.gstin = body.gstin;
    if (body.pan !== undefined) dataToUpdate.pan = body.pan;
    if (body.bankName !== undefined) dataToUpdate.bankName = body.bankName;
    if (body.accountNumber !== undefined) dataToUpdate.accountNumber = body.accountNumber;
    if (body.ifscCode !== undefined) dataToUpdate.ifscCode = body.ifscCode;
    if (body.branch !== undefined) dataToUpdate.branch = body.branch;
    if (body.quotationTerms !== undefined) dataToUpdate.quotationTerms = body.quotationTerms;
    if (body.invoiceTerms !== undefined) dataToUpdate.invoiceTerms = body.invoiceTerms;

    const updated = await prisma.company.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update company details' }, { status: 500 });
  }
}
