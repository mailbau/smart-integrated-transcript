import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { env } from './config/env';
import routes from './routes';
import { prisma } from './config/db';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow Excel files and PDFs
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and PDF files are allowed.'));
    }
  },
});
// CORS configuration with better handling for different environments
const corsOptions = {
  origin: env.isProduction
    ? [env.clientOrigin, 'https://your-production-domain.com'] // Add your production domain
    : [env.clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Debug endpoint to check JWT configuration
app.get('/debug/jwt', (_req, res) => {
  res.json({
    jwtSecret: env.jwtSecret ? 'set' : 'not set',
    jwtSecretLength: env.jwtSecret?.length || 0,
    isDefaultSecret: env.jwtSecret === 'devsecret',
    nodeEnv: process.env.NODE_ENV,
    clientOrigin: env.clientOrigin,
    isProduction: env.isProduction,
    cookieDomain: process.env.COOKIE_DOMAIN || 'not set'
  });
});

// Test endpoint to check if cookies are being set properly
app.get('/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'referer': req.headers.referer
    }
  });
});

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
