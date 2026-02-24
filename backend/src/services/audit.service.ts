import crypto from 'crypto';
import { prisma } from '../config/prisma.js';

export async function writeAuditLog(input: {
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
}) {
  const payload = JSON.stringify(input);
  const immutableHash = crypto.createHash('sha256').update(payload).digest('hex');

  await prisma.auditLog.create({
    data: {
      ...input,
      metadata: input.metadata,
      immutableHash,
      createdBy: input.userId
    }
  });
}
