import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const companyWhere = (companyId && companyId !== 'ALL') ? { companyId, deletedAt: null } : { deletedAt: null };

    const totalLeads = await prisma.lead.count({ where: companyWhere });

    const leads = await prisma.lead.findMany({
      where: companyWhere,
      select: { status: true, estimatedBudget: true }
    });

    const leadGroupMap: Record<string, { status: string; _count: { status: number } }> = {};
    leads.forEach((l) => {
      const st = l.status || 'New';
      if (!leadGroupMap[st]) {
        leadGroupMap[st] = { status: st, _count: { status: 0 } };
      }
      leadGroupMap[st]._count.status += 1;
    });
    const leadsByStatus = Object.values(leadGroupMap);

    const activeProjectsCount = await prisma.project.count({
      where: {
        ...companyWhere,
        status: { in: ['Planning', 'Execution', 'Finishing'] }
      }
    });

    const projects = await prisma.project.findMany({
      where: companyWhere,
      include: {
        invoices: { where: { deletedAt: null }, include: { payments: { where: { deletedAt: null } } } },
        vendorPayments: { where: { deletedAt: null } },
        expenses: { where: { deletedAt: null } },
        extraWorks: { where: { approvalStatus: 'Approved', deletedAt: null } }
      }
    });

    let totalInvoicedRevenue = 0;
    let totalCollectedRevenue = 0;
    let totalVendorPaid = 0;
    let totalSiteExpenses = 0;
    let totalExtraWorkValue = 0;

    projects.forEach((p) => {
      p.invoices?.forEach((inv) => {
        totalInvoicedRevenue += inv.totalAmount || 0;
        inv.payments?.forEach((pay) => {
          totalCollectedRevenue += pay.amountPaid || 0;
        });
      });
      p.vendorPayments?.forEach((vp) => {
        totalVendorPaid += vp.amount || 0;
      });
      p.expenses?.forEach((exp) => {
        totalSiteExpenses += exp.amount || 0;
      });
      p.extraWorks?.forEach((ew) => {
        totalExtraWorkValue += ew.approvedAmount || 0;
      });
    });

    const totalCosts = totalVendorPaid + totalSiteExpenses;
    const netProfit = totalCollectedRevenue - totalCosts;
    const overallMarginPct = totalCollectedRevenue > 0 ? ((netProfit / totalCollectedRevenue) * 100).toFixed(1) : '0';

    const recentQuotations = await prisma.quotation.findMany({
      where: companyWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    });

    const recentProjects = await prisma.project.findMany({
      where: companyWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true }
    });

    const pendingInvoices = await prisma.clientInvoice.findMany({
      where: {
        ...companyWhere,
        status: { in: ['Issued', 'Partial'] }
      },
      take: 6,
      orderBy: { issuedDate: 'desc' },
      include: {
        client: true,
        project: true
      }
    });

    const upcomingReminders = await prisma.workEvent.findMany({
      where: {
        ...(companyId ? { companyId, deletedAt: null } : { deletedAt: null }),
        status: 'Scheduled'
      },
      take: 6,
      orderBy: { eventDate: 'asc' },
      include: {
        project: true
      }
    });

    return NextResponse.json({
      summary: {
        totalLeads,
        activeProjectsCount,
        totalInvoicedRevenue,
        totalCollectedRevenue,
        totalVendorPaid,
        totalSiteExpenses,
        totalExtraWorkValue,
        totalCosts,
        netProfit,
        overallMarginPct
      },
      leadsByStatus,
      recentQuotations,
      recentProjects,
      pendingInvoices,
      upcomingReminders
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json({
      summary: {
        totalLeads: 0,
        activeProjectsCount: 0,
        totalInvoicedRevenue: 0,
        totalCollectedRevenue: 0,
        totalVendorPaid: 0,
        totalSiteExpenses: 0,
        totalExtraWorkValue: 0,
        totalCosts: 0,
        netProfit: 0,
        overallMarginPct: '0'
      },
      leadsByStatus: [],
      recentQuotations: [],
      recentProjects: [],
      pendingInvoices: [],
      upcomingReminders: []
    });
  }
}
