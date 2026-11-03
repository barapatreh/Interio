import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params?.id;
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead inquiry not found' }, { status: 404 });
    }

    // 1. Update lead status to Won
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'Won' }
    });

    // 2. Check if client already exists for this lead
    let client = await prisma.client.findFirst({
      where: { leadId, deletedAt: null }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          companyId: lead.companyId,
          leadId: lead.id,
          name: lead.name,
          email: lead.email || 'client@interio.com',
          phone: lead.phone,
          address: lead.location || 'Site Location TBD',
          city: 'Mumbai',
          propertyType: lead.propertyType || 'Residential Project',
          budget: lead.estimatedBudget || 0,
          status: 'Active',
          notes: lead.notes || `Converted from CRM lead source (${lead.source}). Assigned to ${lead.assignedTo || 'Unassigned'}.`
        }
      });

      // Optionally create a client user login account
      const existingUser = await prisma.user.findFirst({
        where: { email: client.email }
      });

      if (!existingUser && client.email) {
        await prisma.user.create({
          data: {
            companyId: client.companyId,
            clientId: client.id,
            name: `${client.name} (Client)`,
            email: client.email,
            password: 'client123',
            role: 'CLIENT',
            status: 'Active'
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead converted to active client successfully',
      client
    });
  } catch (error) {
    console.error('Error converting lead to client:', error);
    return NextResponse.json({ error: 'Failed to convert lead to client' }, { status: 500 });
  }
}
