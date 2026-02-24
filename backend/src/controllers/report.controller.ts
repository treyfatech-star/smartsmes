import { Response } from 'express';
import { stringify } from 'csv-stringify/sync';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateVatSummary } from '../services/vat-report.service.js';

export async function monthlyVatReport(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const period = String(req.query.period);
  const payload = await generateVatSummary(req.auth.tenantId, period, req.auth.sub);
  return res.json(payload);
}

export async function monthlyVatCsv(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const period = String(req.query.period);
  const payload = await generateVatSummary(req.auth.tenantId, period, req.auth.sub);

  const csv = stringify([
    ['period', period],
    ['output_vat_kobo', payload.record.outputVatKobo],
    ['input_vat_kobo', payload.record.inputVatKobo],
    ['net_vat_payable_kobo', payload.record.netVatPayableKobo],
    ['transactions', payload.record.transactionCount]
  ]);

  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
}
