import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { prisma } from './config/db';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.clientOrigin, credentials: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

// simple seed admin endpoint (disable after first run)
app.post('/seed-admin', async (req, res) => {
  const { email = "admin@sit.ac.id", password = "admin123", name = "Admin", nim = "000000", dob = "2000-01-01" } = req.body || {};
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.json({ message: 'exists' });
  const bcrypt = await import('bcryptjs');
  const hashed = await bcrypt.default.hash(password, 10);
  const u = await prisma.user.create({ data: { email, password: hashed, name, nim, dob: new Date(dob), role: 'ADMIN' } });
  res.json({ admin: { id: u.id, email: u.email } });
});



export default app;
