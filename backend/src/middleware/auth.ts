import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { prisma } from '../config/db';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const payload = verifyJwt<{ userId: string }>(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      console.log('User not found for token payload:', payload.userId);
      return res.status(401).json({ message: 'Invalid token' });
    }

    (req as any).user = user;
    next();
  } catch (e: any) {
    console.error('Auth middleware error:', e.message);
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  next();
}
