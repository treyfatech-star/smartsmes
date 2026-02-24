import dayjs from 'dayjs';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

export async function dashboardMetrics(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const start = dayjs().startOf('month').toDate();

  const [revenue, expenses, outstanding, vat] = await Promise.all([
    prisma.invoice.aggregate({ where: { tenantId: req.auth.tenantId, issueDate: { gte: start }, status: { not: 'DRAFT' }, isDeleted: false }, _sum: { totalKobo: true } }),
    prisma.expense.aggregate({ where: { tenantId: req.auth.tenantId, expenseDate: { gte: start }, isDeleted: false }, _sum: { grossAmountKobo: true } }),
    prisma.invoice.count({ where: { tenantId: req.auth.tenantId, status: { in: ['ISSUED'] }, isDeleted: false } }),
    prisma.vATRecord.findFirst({ where: { tenantId: req.auth.tenantId }, orderBy: { period: 'desc' } })
  ]);

  return res.json({
    monthlyRevenueKobo: revenue._sum.totalKobo ?? 0,
    monthlyExpensesKobo: expenses._sum.grossAmountKobo ?? 0,
    outputVatKobo: vat?.outputVatKobo ?? 0,
    inputVatKobo: vat?.inputVatKobo ?? 0,
    netVatPayableKobo: vat?.netVatPayableKobo ?? 0,
    outstandingInvoices: outstanding,
    vatComplianceIndicator: (vat?.netVatPayableKobo ?? 0) >= 0 ? 'READY_TO_FILE' : 'CREDIT_POSITION'
  });
}
