import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const projectId = searchParams.get('projectId');

    const contracts = await prisma.vendorContract.findMany({
      where: {
        deletedAt: null,
        ...(vendorId ? { vendorId } : {}),
        ...(projectId ? { projectId } : {})
      },
      include: {
        vendor: true,
        project: true,
        materials: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contracts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendor contracts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const labourAmount = parseFloat(body.labourAmount || 0);
    const materialAmount = parseFloat(body.materialAmount || 0);
    const agreedAmount = labourAmount + materialAmount;

    const contract = await prisma.vendorContract.create({
      data: {
        vendorId: body.vendorId,
        projectId: body.projectId,
        contractType: body.contractType || 'LABOUR_AND_MATERIAL', // LABOUR_AND_MATERIAL, LABOUR_ONLY
        workType: body.workType || 'Subcontract',
        scopeDescription: body.scopeDescription,
        labourAmount,
        materialAmount,
        agreedAmount,
        status: 'Active',
        materials: {
          create: body.materials?.map((m: any) => ({
            materialName: m.materialName,
            specification: m.specification,
            quantity: parseFloat(m.quantity || 1),
            unit: m.unit || 'unit',
            unitPrice: parseFloat(m.unitPrice || 0),
            totalPrice: parseFloat(m.quantity || 1) * parseFloat(m.unitPrice || 0)
          })) || []
        }
      },
      include: { vendor: true, project: true, materials: true }
    });

    // If contractType === 'LABOUR_ONLY', auto-create site expense items for material tracking
    if (body.contractType === 'LABOUR_ONLY' && body.materials && body.materials.length > 0) {
      for (const mat of body.materials) {
        const matTotal = parseFloat(mat.quantity || 1) * parseFloat(mat.unitPrice || 0);
        if (matTotal > 0) {
          await prisma.siteExpense.create({
            data: {
              companyId: contract.project.companyId,
              projectId: body.projectId,
              title: `Material Purchase for ${contract.vendor.name}: ${mat.materialName}`,
              category: 'Material',
              amount: matTotal,
              recordedBy: 'Subcontract Procurement System',
              notes: `Spec: ${mat.specification || 'N/A'}, Qty: ${mat.quantity} ${mat.unit} @ ₹${mat.unitPrice}/${mat.unit}`
            }
          });
        }
      }
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error assigning vendor to project:', error);
    return NextResponse.json({ error: 'Failed to assign vendor to project' }, { status: 500 });
  }
}
