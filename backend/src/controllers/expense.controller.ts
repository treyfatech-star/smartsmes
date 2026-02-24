import { Response } from 'express';
import { z } from 'zod';
import { VatCategory } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { resolveVatRate } from '../utils/vat.js';
import { writeAuditLog } from '../services/audit.service.js';

const createExpenseSchema = z.object({
  vendorId: z.string().optional(),
  category: z.string(),
  description: z.string(),
  expenseDate: z.string().datetime(),
  grossAmountKobo: z.number().int().positive(),
  vatCategory: z.nativeEnum(VatCategory),
  reference: z.string().optional()
});

export async function createExpense(req: AuthenticatedRequest, res: Response) {
  const parsed = createExpenseSchema.safeParse(req.body);
  if (!parsed.success || !req.auth) return res.status(422).json({ message: 'Invalid payload' });

  const vatRate = resolveVatRate(parsed.data.vatCategory);
  const inputVatKobo = Math.round(parsed.data.grossAmountKobo * vatRate / (1 + vatRate));
  const netAmountKobo = parsed.data.grossAmountKobo - inputVatKobo;

  const expense = await prisma.expense.create({
    data: {
      tenantId: req.auth.tenantId,
      vendorId: parsed.data.vendorId,
      category: parsed.data.category,
      description: parsed.data.description,
      expenseDate: new Date(parsed.data.expenseDate),
      grossAmountKobo: parsed.data.grossAmountKobo,
      vatCategory: parsed.data.vatCategory,
      inputVatKobo,
      netAmountKobo,
      reference: parsed.data.reference,
      createdBy: req.auth.sub,
      createdByUserId: req.auth.sub
    }
  });

  await writeAuditLog({ tenantId: req.auth.tenantId, userId: req.auth.sub, action: 'EXPENSE_CREATED', entityType: 'Expense', entityId: expense.id, metadata: { inputVatKobo } });

  return res.status(201).json(expense);
}

export async function listExpenses(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const data = await prisma.expense.findMany({ where: { tenantId: req.auth.tenantId, isDeleted: false }, orderBy: { expenseDate: 'desc' } });
  return res.json({ data });
}
