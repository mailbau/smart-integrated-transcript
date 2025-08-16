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

// debug R2 configuration
app.get('/debug-r2', (req, res) => {
  const { env } = require('./config/env');
  res.json({
    r2Configured: {
      accountId: !!env.r2.accountId,
      accessKeyId: !!env.r2.accessKeyId,
      secretAccessKey: !!env.r2.secretAccessKey,
      bucket: !!env.r2.bucket,
      publicBaseUrl: !!env.r2.publicBaseUrl
    },
    publicBaseUrl: env.r2.publicBaseUrl,
    sampleUrl: env.r2.publicBaseUrl ? `${env.r2.publicBaseUrl}/test-file.pdf` : null
  });
});

// migrate existing transcript URLs to new R2 public base URL
app.post('/migrate-transcript-urls', async (req, res) => {
  try {
    const { env } = require('./config/env');
    const { prisma } = require('./config/db');

    if (!env.r2.publicBaseUrl) {
      return res.status(400).json({ error: 'R2_PUBLIC_BASE_URL not configured' });
    }

    // Get all requests with transcriptKey but old transcriptUrl
    const requests = await prisma.request.findMany({
      where: {
        transcriptKey: { not: null },
        transcriptUrl: { not: null }
      }
    });

    let updatedCount = 0;

    for (const request of requests) {
      if (request.transcriptKey) {
        const newUrl = `${env.r2.publicBaseUrl}/${request.transcriptKey}`;

        await prisma.request.update({
          where: { id: request.id },
          data: { transcriptUrl: newUrl }
        });

        updatedCount++;
        console.log(`Updated request ${request.id}: ${request.transcriptUrl} -> ${newUrl}`);
      }
    }

    res.json({
      message: `Updated ${updatedCount} transcript URLs`,
      updatedCount,
      newBaseUrl: env.r2.publicBaseUrl
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed', details: (error as Error).message });
  }
});

export default app;
