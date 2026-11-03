-- ============================================================================
-- INTERIO LUXURY FITOUTS & MULTI-COMPANY ENTERPRISE MANAGEMENT SYSTEM
-- COMPLETE MYSQL DATABASE DDL SCHEMA SCRIPT
-- Compatible with MySQL 5.7, 8.0+, MariaDB 10.3+
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `interio_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `interio_db`;

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS `Company` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `logoUrl` TEXT NULL,
  `tagline` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `address` TEXT NULL,
  `gstin` VARCHAR(191) NULL,
  `pan` VARCHAR(191) NULL,
  `bankName` VARCHAR(191) NULL,
  `accountNumber` VARCHAR(191) NULL,
  `ifscCode` VARCHAR(191) NULL,
  `branch` VARCHAR(191) NULL,
  `quotationTerms` TEXT NULL,
  `invoiceTerms` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Company_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. LEADS TABLE
CREATE TABLE IF NOT EXISTS `Lead` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NOT NULL,
  `source` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'New',
  `assignedTo` VARCHAR(191) NULL,
  `propertyType` VARCHAR(191) NULL,
  `estimatedBudget` DOUBLE NULL,
  `location` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `Lead_companyId_idx` (`companyId`),
  CONSTRAINT `Lead_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS `Client` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `leadId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NOT NULL,
  `alternatePhone` VARCHAR(191) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(191) NULL,
  `propertyType` VARCHAR(191) NULL,
  `budget` DOUBLE NULL,
  `notes` TEXT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `Client_companyId_idx` (`companyId`),
  KEY `Client_leadId_idx` (`leadId`),
  CONSTRAINT `Client_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Client_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. VENDORS TABLE
CREATE TABLE IF NOT EXISTS `Vendor` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `companyName` VARCHAR(191) NULL,
  `trade` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `gstin` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `Vendor_companyId_idx` (`companyId`),
  CONSTRAINT `Vendor_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. USERS TABLE
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `clientId` VARCHAR(191) NULL,
  `vendorId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_companyId_idx` (`companyId`),
  KEY `User_clientId_idx` (`clientId`),
  KEY `User_vendorId_idx` (`vendorId`),
  CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `User_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `User_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SERVICE CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS `ServiceCatalogue` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `category` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `unit` VARCHAR(191) NOT NULL,
  `defaultPrice` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `ServiceCatalogue_companyId_idx` (`companyId`),
  CONSTRAINT `ServiceCatalogue_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS `Quotation` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `quoteNumber` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NOT NULL,
  `clientName` VARCHAR(191) NOT NULL,
  `clientPhone` VARCHAR(191) NULL,
  `siteAddress` TEXT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
  `subtotal` DOUBLE NOT NULL DEFAULT 0,
  `discountAmount` DOUBLE NOT NULL DEFAULT 0,
  `taxRate` DOUBLE NOT NULL DEFAULT 18,
  `taxAmount` DOUBLE NOT NULL DEFAULT 0,
  `grandTotal` DOUBLE NOT NULL DEFAULT 0,
  `validityDays` INT NOT NULL DEFAULT 30,
  `terms` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Quotation_quoteNumber_key` (`quoteNumber`),
  KEY `Quotation_companyId_idx` (`companyId`),
  KEY `Quotation_clientId_idx` (`clientId`),
  CONSTRAINT `Quotation_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Quotation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. QUOTATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS `QuotationItem` (
  `id` VARCHAR(191) NOT NULL,
  `quotationId` VARCHAR(191) NOT NULL,
  `room` VARCHAR(191) NOT NULL DEFAULT 'General',
  `category` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `quantity` DOUBLE NOT NULL DEFAULT 1,
  `unit` VARCHAR(191) NOT NULL DEFAULT 'sq.ft',
  `unitRate` DOUBLE NOT NULL DEFAULT 0,
  `totalAmount` DOUBLE NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `QuotationItem_quotationId_idx` (`quotationId`),
  CONSTRAINT `QuotationItem_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS `Project` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `projectNumber` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NOT NULL,
  `quotationId` VARCHAR(191) NULL,
  `title` VARCHAR(191) NOT NULL,
  `siteAddress` TEXT NOT NULL,
  `startDate` DATETIME(3) NULL,
  `targetEndDate` DATETIME(3) NULL,
  `actualEndDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Planning',
  `budget` DOUBLE NOT NULL DEFAULT 0,
  `progressPercentage` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Project_projectNumber_key` (`projectNumber`),
  KEY `Project_companyId_idx` (`companyId`),
  KEY `Project_clientId_idx` (`clientId`),
  KEY `Project_quotationId_idx` (`quotationId`),
  CONSTRAINT `Project_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Project_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Project_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PROJECT MILESTONES TABLE
CREATE TABLE IF NOT EXISTS `ProjectMilestone` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `dueDate` DATETIME(3) NULL,
  `completedDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ProjectMilestone_projectId_idx` (`projectId`),
  CONSTRAINT `ProjectMilestone_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. DESIGNS TABLE
CREATE TABLE IF NOT EXISTS `Design` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `fileUrl` LONGTEXT NOT NULL,
  `version` VARCHAR(191) NOT NULL DEFAULT 'v1.0',
  `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
  `clientFeedback` TEXT NULL,
  `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `Design_projectId_idx` (`projectId`),
  CONSTRAINT `Design_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. VENDOR CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS `VendorContract` (
  `id` VARCHAR(191) NOT NULL,
  `vendorId` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `contractType` VARCHAR(191) NOT NULL DEFAULT 'LABOUR_AND_MATERIAL',
  `workType` VARCHAR(191) NOT NULL,
  `scopeDescription` TEXT NULL,
  `labourAmount` DOUBLE NOT NULL DEFAULT 0,
  `materialAmount` DOUBLE NOT NULL DEFAULT 0,
  `agreedAmount` DOUBLE NOT NULL DEFAULT 0,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `VendorContract_vendorId_idx` (`vendorId`),
  KEY `VendorContract_projectId_idx` (`projectId`),
  CONSTRAINT `VendorContract_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `VendorContract_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. VENDOR CONTRACT MATERIAL ITEMS TABLE
CREATE TABLE IF NOT EXISTS `VendorContractMaterialItem` (
  `id` VARCHAR(191) NOT NULL,
  `vendorContractId` VARCHAR(191) NOT NULL,
  `materialName` VARCHAR(191) NOT NULL,
  `specification` TEXT NULL,
  `quantity` DOUBLE NOT NULL DEFAULT 1,
  `unit` VARCHAR(191) NOT NULL DEFAULT 'sheet',
  `unitPrice` DOUBLE NOT NULL DEFAULT 0,
  `totalPrice` DOUBLE NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `VendorContractMaterialItem_vendorContractId_idx` (`vendorContractId`),
  CONSTRAINT `VendorContractMaterialItem_vendorContractId_fkey` FOREIGN KEY (`vendorContractId`) REFERENCES `VendorContract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. MATERIAL REQUISITIONS TABLE
CREATE TABLE IF NOT EXISTS `MaterialRequisition` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `requisitionNumber` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `vendorId` VARCHAR(191) NULL,
  `purpose` TEXT NULL,
  `requisitionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'Requested',
  `totalPurchaseCost` DOUBLE NOT NULL DEFAULT 0,
  `invoiceUrl` TEXT NULL,
  `purchaseNotes` TEXT NULL,
  `purchasedAt` DATETIME(3) NULL,
  `deliveredAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MaterialRequisition_requisitionNumber_key` (`requisitionNumber`),
  KEY `MaterialRequisition_companyId_idx` (`companyId`),
  KEY `MaterialRequisition_projectId_idx` (`projectId`),
  KEY `MaterialRequisition_vendorId_idx` (`vendorId`),
  CONSTRAINT `MaterialRequisition_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MaterialRequisition_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MaterialRequisition_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. MATERIAL REQUISITION ITEMS TABLE
CREATE TABLE IF NOT EXISTS `MaterialRequisitionItem` (
  `id` VARCHAR(191) NOT NULL,
  `materialRequisitionId` VARCHAR(191) NOT NULL,
  `materialName` VARCHAR(191) NOT NULL,
  `specification` TEXT NULL,
  `quantity` DOUBLE NOT NULL DEFAULT 1,
  `unit` VARCHAR(191) NOT NULL DEFAULT 'unit',
  `unitPrice` DOUBLE NULL DEFAULT 0,
  `totalPrice` DOUBLE NULL DEFAULT 0,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Requested',
  PRIMARY KEY (`id`),
  KEY `MaterialRequisitionItem_materialRequisitionId_idx` (`materialRequisitionId`),
  CONSTRAINT `MaterialRequisitionItem_materialRequisitionId_fkey` FOREIGN KEY (`materialRequisitionId`) REFERENCES `MaterialRequisition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. CLIENT INVOICES TABLE
CREATE TABLE IF NOT EXISTS `ClientInvoice` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `invoiceNumber` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NOT NULL,
  `milestoneName` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `taxAmount` DOUBLE NOT NULL DEFAULT 0,
  `totalAmount` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Issued',
  `dueDate` DATETIME(3) NULL,
  `issuedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notes` TEXT NULL,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ClientInvoice_invoiceNumber_key` (`invoiceNumber`),
  KEY `ClientInvoice_companyId_idx` (`companyId`),
  KEY `ClientInvoice_projectId_idx` (`projectId`),
  KEY `ClientInvoice_clientId_idx` (`clientId`),
  CONSTRAINT `ClientInvoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ClientInvoice_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ClientInvoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. CLIENT PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `ClientPayment` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `invoiceId` VARCHAR(191) NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `clientId` VARCHAR(191) NOT NULL,
  `amountPaid` DOUBLE NOT NULL,
  `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `paymentMode` VARCHAR(191) NOT NULL,
  `transactionRef` VARCHAR(191) NULL,
  `proofUrl` TEXT NULL,
  `receiptNumber` VARCHAR(191) NULL,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `ClientPayment_companyId_idx` (`companyId`),
  KEY `ClientPayment_invoiceId_idx` (`invoiceId`),
  KEY `ClientPayment_projectId_idx` (`projectId`),
  KEY `ClientPayment_clientId_idx` (`clientId`),
  CONSTRAINT `ClientPayment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ClientPayment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `ClientInvoice` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ClientPayment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ClientPayment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. VENDOR PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `VendorPayment` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `vendorId` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `paymentMode` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL DEFAULT 'Labour',
  `notes` TEXT NULL,
  `transactionRef` VARCHAR(191) NULL,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `VendorPayment_companyId_idx` (`companyId`),
  KEY `VendorPayment_vendorId_idx` (`vendorId`),
  KEY `VendorPayment_projectId_idx` (`projectId`),
  CONSTRAINT `VendorPayment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `VendorPayment_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `VendorPayment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. SITE EXPENSES TABLE
CREATE TABLE IF NOT EXISTS `SiteExpense` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `expenseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `recordedBy` VARCHAR(191) NULL,
  `receiptUrl` TEXT NULL,
  `notes` TEXT NULL,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `SiteExpense_companyId_idx` (`companyId`),
  KEY `SiteExpense_projectId_idx` (`projectId`),
  CONSTRAINT `SiteExpense_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SiteExpense_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. EXTRA WORKS TABLE
CREATE TABLE IF NOT EXISTS `ExtraWork` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `workTitle` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `requestedBy` VARCHAR(191) NOT NULL DEFAULT 'Client',
  `estimatedCost` DOUBLE NOT NULL,
  `approvedAmount` DOUBLE NOT NULL DEFAULT 0,
  `approvalStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending',
  `createdDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `billingAdded` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `ExtraWork_companyId_idx` (`companyId`),
  KEY `ExtraWork_projectId_idx` (`projectId`),
  CONSTRAINT `ExtraWork_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ExtraWork_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
