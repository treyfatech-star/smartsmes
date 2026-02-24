import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantId: z.string().min(5)
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json(parsed.error.flatten());

  const user = await prisma.user.findFirst({ where: { tenantId: parsed.data.tenantId, email: parsed.data.email, isActive: true } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role }, env.jwtSecret, { expiresIn: '12h' });
  return res.json({ token, user: { id: user.id, fullName: user.fullName, role: user.role, tenantId: user.tenantId } });
}
