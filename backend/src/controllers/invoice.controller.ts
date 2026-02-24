import { Response } from 'express';
import { z } from 'zod';
import { InvoiceStatus, VatCategory } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { computeVatInclusiveLine } from '../utils/vat.js';
import { writeAuditLog } from '../services/audit.service.js';

const itemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPriceKobo: z.number().int().positive(),
  vatCategory: z.nativeEnum(VatCategory)
});

const createInvoiceSchema = z.object({
  customerId: z.string(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1)
});

export async function createInvoice(req: AuthenticatedRequest, res: Response) {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success || !req.auth) return res.status(422).json({ message: 'Invalid payload' });

  const tenant = await prisma.tenant.update({ where: { id: req.auth.tenantId }, data: { invoiceSequence: { increment: 1 } } });
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(tenant.invoiceSequence).padStart(4, '0')}`;

  const lines = parsed.data.items.map((item) => ({ ...item, ...computeVatInclusiveLine(item.quantity, item.unitPriceKobo, item.vatCategory) }));
  const subtotalKobo = lines.reduce((sum, line) => sum + line.taxableAmountKobo, 0);
  const outputVatKobo = lines.reduce((sum, line) => sum + line.vatAmountKobo, 0);

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: req.auth.tenantId,
      customerId: parsed.data.customerId,
      invoiceNumber,
      issueDate: new Date(parsed.data.issueDate),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: InvoiceStatus.DRAFT,
      subtotalKobo,
      outputVatKobo,
      totalKobo: subtotalKobo + outputVatKobo,
      notes: parsed.data.notes,
      createdBy: req.auth.sub,
      createdByUserId: req.auth.sub,
      nrsPayload: {
        schemaVersion: '1.0.0',
        invoiceNumber,
        issueDate: parsed.data.issueDate,
        lines
      },
      invoiceItems: {
        create: lines.map((line) => ({
          description: line.description,
          quantity: String(line.quantity),
          unitPriceKobo: line.unitPriceKobo,
          vatCategory: line.vatCategory,
          vatRate: String(line.rate),
          taxableAmountKobo: line.taxableAmountKobo,
          vatAmountKobo: line.vatAmountKobo,
          lineTotalKobo: line.lineTotalKobo,
          createdBy: req.auth!.sub
        }))
      }
    },
    include: { invoiceItems: true }
  });

  await writeAuditLog({
    tenantId: req.auth.tenantId,
    userId: req.auth.sub,
    action: 'INVOICE_CREATED',
    entityType: 'Invoice',
    entityId: invoice.id,
    metadata: { invoiceNumber }
  });

  return res.status(201).json(invoice);
}

export async function listInvoices(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);

  const invoices = await prisma.invoice.findMany({
    where: { tenantId: req.auth.tenantId, isDeleted: false },
    include: { customer: true },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' }
  });

  return res.json({ data: invoices, page, pageSize });
}

export async function invoicePdf(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, tenantId: req.auth.tenantId },
    include: { customer: true, invoiceItems: true }
  });
  if (!invoice) return res.status(404).json({ message: 'Not found' });

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
  doc.pipe(res);
  doc.fontSize(18).text(`Invoice ${invoice.invoiceNumber}`);
  doc.text(`Customer: ${invoice.customer.name}`);
  doc.text(`Subtotal: ${(invoice.subtotalKobo / 100).toFixed(2)}`);
  doc.text(`VAT: ${(invoice.outputVatKobo / 100).toFixed(2)}`);
  doc.text(`Total: ${(invoice.totalKobo / 100).toFixed(2)}`);
  doc.end();
}
