import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';

const cookieOptsDev = { httpOnly: true as const, sameSite: 'lax' as const };
const cookieOptsProd = { httpOnly: true as const, sameSite: 'none' as const, secure: true };
const cookieOpts = process.env.NODE_ENV === 'production' ? cookieOptsProd : cookieOptsDev;

export async function register(req: Request, res: Response) {
  try {
    const { name, nim, dob, email, password } = req.body;

    // Validate required fields
    if (!name || !nim || !dob || !email || !password) {
      return res.status(400).json({
        message: 'Semua field harus diisi (nama, NIM, tanggal lahir, email, dan kata sandi)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Format email tidak valid. Silakan masukkan email yang benar.'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Kata sandi minimal 6 karakter'
      });
    }

    // Check if email already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.'
      });
    }

    // Validate date format
    const dateObj = new Date(dob);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        message: 'Format tanggal lahir tidak valid'
      });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, nim, dob: dateObj, email, password: hashed }
    });

    const token = signJwt({ userId: user.id });
    res.cookie('token', token, cookieOpts);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) {
    console.error('Registration error:', e);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan kata sandi harus diisi'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Format email tidak valid. Silakan masukkan email yang benar.'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: 'Email atau kata sandi salah. Silakan periksa kembali kredensial Anda.'
      });
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return res.status(400).json({
        message: 'Email atau kata sandi salah. Silakan periksa kembali kredensial Anda.'
      });
    }

    const token = signJwt({ userId: user.id });
    res.cookie('token', token, cookieOpts);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) {
    console.error('Login error:', e);
    res.status(500).json({
      message: 'Terjadi kesalahan saat masuk. Silakan coba lagi.'
    });
  }
}

export function me(req: Request, res: Response) {
  const user = (req as any).user;
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export function logout(req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'ok' });
}
