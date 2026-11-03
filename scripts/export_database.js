const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function exportAll() {
  console.log('Fetching live database records...');

  const data = {
    Company: await prisma.company.findMany(),
    User: await prisma.user.findMany(),
    Lead: await prisma.lead.findMany(),
    Client: await prisma.client.findMany(),
    ServiceCatalogue: await prisma.serviceCatalogue.findMany(),
    Quotation: await prisma.quotation.findMany(),
    QuotationItem: await prisma.quotationItem.findMany(),
    Project: await prisma.project.findMany(),
    ProjectMilestone: await prisma.projectMilestone.findMany(),
    Design: await prisma.design.findMany(),
    Vendor: await prisma.vendor.findMany(),
    VendorContract: await prisma.vendorContract.findMany(),
    VendorContractMaterialItem: await prisma.vendorContractMaterialItem.findMany(),
    MaterialRequisition: await prisma.materialRequisition.findMany(),
    MaterialRequisitionItem: await prisma.materialRequisitionItem.findMany(),
    ClientInvoice: await prisma.clientInvoice.findMany(),
    ClientPayment: await prisma.clientPayment.findMany(),
    VendorPayment: await prisma.vendorPayment.findMany(),
    SiteExpense: await prisma.siteExpense.findMany(),
    ExtraWork: await prisma.extraWork.findMany(),
    Ticket: await prisma.ticket.findMany(),
    WorkEvent: await prisma.workEvent.findMany()
  };

  const jsonPath = path.join(__dirname, '..', 'prisma', 'database_backup.json');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Saved JSON backup to: ${jsonPath}`);

  // Generate SQL Dump file
  let sql = `-- ============================================================================\n`;
  sql += `-- INTERIO PLATFORM - COMPLETE DATABASE BACKUP & DATA DUMP\n`;
  sql += `-- Export Date: ${new Date().toISOString()}\n`;
  sql += `-- Database: TiDB Cloud / MySQL compatible\n`;
  sql += `-- ============================================================================\n\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  for (const [tableName, rows] of Object.entries(data)) {
    if (!rows || rows.length === 0) continue;
    sql += `-- ----------------------------------------------------------------------------\n`;
    sql += `-- Records for Table: \`${tableName}\` (${rows.length} rows)\n`;
    sql += `-- ----------------------------------------------------------------------------\n`;
    
    const sample = rows[0];
    const columns = Object.keys(sample).map(c => `\`${c}\``).join(', ');

    for (const row of rows) {
      const values = Object.values(row).map(escapeSql).join(', ');
      sql += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
    }
    sql += `\n`;
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const sqlPath = path.join(__dirname, '..', 'prisma', 'database_backup.sql');
  fs.writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`Saved SQL dump to: ${sqlPath}`);
}

exportAll()
  .catch((err) => {
    console.error('Export failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
