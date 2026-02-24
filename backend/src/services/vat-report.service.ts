import dayjs from 'dayjs';
import { prisma } from '../config/prisma.js';

export async function generateVatSummary(tenantId: string, period: string, userId: string) {
  const start = dayjs(`${period}-01`).startOf('month').toDate();
  const end = dayjs(start).endOf('month').toDate();

  const [salesAgg, expenseAgg, invoices, expenses] = await Promise.all([
    prisma.invoice.aggregate({
      where: { tenantId, issueDate: { gte: start, lte: end }, isDeleted: false, status: { not: 'DRAFT' } },
      _sum: { outputVatKobo: true }
    }),
    prisma.expense.aggregate({
      where: { tenantId, expenseDate: { gte: start, lte: end }, isDeleted: false },
      _sum: { inputVatKobo: true }
    }),
    prisma.invoice.findMany({ where: { tenantId, issueDate: { gte: start, lte: end }, isDeleted: false } }),
    prisma.expense.findMany({ where: { tenantId, expenseDate: { gte: start, lte: end }, isDeleted: false } })
  ]);

  const outputVatKobo = salesAgg._sum.outputVatKobo ?? 0;
  const inputVatKobo = expenseAgg._sum.inputVatKobo ?? 0;
  const netVatPayableKobo = outputVatKobo - inputVatKobo;

  const record = await prisma.vATRecord.upsert({
    where: { tenantId_period: { tenantId, period } },
    update: { outputVatKobo, inputVatKobo, netVatPayableKobo, transactionCount: invoices.length + expenses.length },
    create: {
      tenantId,
      period,
      outputVatKobo,
      inputVatKobo,
      netVatPayableKobo,
      transactionCount: invoices.length + expenses.length,
      createdBy: userId
    }
  });

  return { record, invoices, expenses };
}
