import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const companyWhere = companyId ? { companyId, deletedAt: null } : { deletedAt: null };

    const projects = await prisma.project.findMany({
      where: companyWhere,
      include: {
        client: true,
        invoices: { where: { deletedAt: null }, include: { payments: { where: { deletedAt: null } } } },
        vendorPayments: { where: { deletedAt: null }, include: { vendor: true } },
        expenses: { where: { deletedAt: null } },
        extraWorks: { where: { approvalStatus: 'Approved', deletedAt: null } }
      }
    });

    const profitabilityData = projects.map((project) => {
      // 1. Revenue
      const totalInvoiced = project.invoices?.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) || 0;
      const totalCollected = project.invoices?.reduce((sum, inv) => {
        return sum + (inv.payments?.reduce((pSum, p) => pSum + (p.amountPaid || 0), 0) || 0);
      }, 0) || 0;
      const extraWorkRevenue = project.extraWorks?.reduce((sum, ew) => sum + (ew.approvedAmount || 0), 0) || 0;

      // 2. Costs
      const vendorPayouts = project.vendorPayments?.reduce((sum, vp) => sum + (vp.amount || 0), 0) || 0;
      const siteExpenses = project.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      const totalProjectCost = vendorPayouts + siteExpenses;

      // 3. Profitability
      const netProfit = totalCollected - totalProjectCost;
      const profitMarginPct = totalCollected > 0 ? ((netProfit / totalCollected) * 100).toFixed(1) : '0';

      return {
        id: project.id,
        projectNumber: project.projectNumber,
        title: project.title,
        clientName: project.client?.name || 'N/A',
        status: project.status,
        budget: project.budget,
        progressPercentage: project.progressPercentage,
        financials: {
          totalInvoiced,
          totalCollected,
          extraWorkRevenue,
          effectiveRevenue: totalCollected + extraWorkRevenue,
          vendorPayouts,
          siteExpenses,
          totalProjectCost,
          netProfit,
          profitMarginPct: parseFloat(profitMarginPct)
        }
      };
    });

    return NextResponse.json(profitabilityData);
  } catch (error) {
    console.error('Error calculating project profitability:', error);
    return NextResponse.json({ error: 'Failed to calculate profitability' }, { status: 500 });
  }
}
