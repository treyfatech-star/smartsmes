import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthPayload = {
  sub: string;
  tenantId: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'STAFF';
};

export type AuthenticatedRequest = Request & { auth?: AuthPayload };

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const token = authHeader.replace('Bearer ', '');
    req.auth = jwt.verify(token, env.jwtSecret) as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function authorize(...roles: AuthPayload['role'][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.auth.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
