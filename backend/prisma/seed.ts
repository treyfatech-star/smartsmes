import { PrismaClient, Role, SubscriptionTier, VatCategory, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Lagos Trade Hub Ltd',
      tin: 'TIN-209384-01',
      vatNumber: 'VAT-90213',
      address: '12 Marina Road, Lagos',
      email: 'finance@lagostradehub.ng',
      invoiceSequence: 3
    }
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@lagostradehub.ng',
      fullName: 'Chika Okafor',
      passwordHash,
      role: Role.ADMIN,
      createdBy: 'seed'
    }
  });

  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Adebayo Retail Stores',
      email: 'payables@adebayoretail.ng',
      tin: 'TIN-883020',
      createdBy: admin.id
    }
  });

  const vendor = await prisma.vendor.create({
    data: {
      tenantId: tenant.id,
      name: 'Atlantic Office Supplies',
      tin: 'TIN-7782',
      createdBy: admin.id
    }
  });

  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      tier: SubscriptionTier.SME,
      priceKobo: 250000,
      invoicesLimit: null,
      status: 'active',
      startDate: new Date(),
      createdBy: admin.id
    }
  });

  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      invoiceNumber: 'INV-2026-0001',
      issueDate: new Date(),
      status: InvoiceStatus.ISSUED,
      subtotalKobo: 1000000,
      outputVatKobo: 75000,
      totalKobo: 1075000,
      nrsPayload: { version: '1.0', lines: 1 },
      createdBy: admin.id,
      createdByUserId: admin.id,
      invoiceItems: {
        create: {
          description: 'Bulk stationery order',
          quantity: '10',
          unitPriceKobo: 100000,
          vatCategory: VatCategory.STANDARD,
          vatRate: '0.0750',
          taxableAmountKobo: 1000000,
          vatAmountKobo: 75000,
          lineTotalKobo: 1075000,
          createdBy: admin.id
        }
      }
    }
  });

  await prisma.expense.create({
    data: {
      tenantId: tenant.id,
      vendorId: vendor.id,
      category: 'Office Supplies',
      description: 'Paper and toner purchase',
      expenseDate: new Date(),
      grossAmountKobo: 215000,
      vatCategory: VatCategory.STANDARD,
      inputVatKobo: 15000,
      netAmountKobo: 200000,
      createdBy: admin.id,
      createdByUserId: admin.id
    }
  });
}

main().finally(async () => prisma.$disconnect());
