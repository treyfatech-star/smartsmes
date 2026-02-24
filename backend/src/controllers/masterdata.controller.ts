import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const customerSchema = z.object({ name: z.string(), email: z.string().email().optional(), tin: z.string().optional(), phone: z.string().optional(), address: z.string().optional() });
const vendorSchema = z.object({ name: z.string(), email: z.string().email().optional(), tin: z.string().optional(), phone: z.string().optional(), address: z.string().optional() });

export async function createCustomer(req: AuthenticatedRequest, res: Response) {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success || !req.auth) return res.status(422).json({ message: 'Invalid payload' });
  const data = await prisma.customer.create({ data: { ...parsed.data, tenantId: req.auth.tenantId, createdBy: req.auth.sub } });
  res.status(201).json(data);
}

export async function listCustomers(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const data = await prisma.customer.findMany({ where: { tenantId: req.auth.tenantId, isDeleted: false }, orderBy: { name: 'asc' } });
  res.json({ data });
}

export async function createVendor(req: AuthenticatedRequest, res: Response) {
  const parsed = vendorSchema.safeParse(req.body);
  if (!parsed.success || !req.auth) return res.status(422).json({ message: 'Invalid payload' });
  const data = await prisma.vendor.create({ data: { ...parsed.data, tenantId: req.auth.tenantId, createdBy: req.auth.sub } });
  res.status(201).json(data);
}

export async function listVendors(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const data = await prisma.vendor.findMany({ where: { tenantId: req.auth.tenantId, isDeleted: false }, orderBy: { name: 'asc' } });
  res.json({ data });
}

export async function getSubscription(req: AuthenticatedRequest, res: Response) {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  const data = await prisma.subscription.findFirst({ where: { tenantId: req.auth.tenantId }, orderBy: { createdAt: 'desc' } });
  res.json({ data });
}
