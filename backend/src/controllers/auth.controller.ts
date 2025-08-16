import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  try {
    const { name, nim, dob, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, nim, dob: new Date(dob), email, password: hashed }
    });
    const token = signJwt({ userId: user.id });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = signJwt({ userId: user.id });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export function me(req: Request, res: Response) {
  const user = (req as any).user;
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'ok' });
}
