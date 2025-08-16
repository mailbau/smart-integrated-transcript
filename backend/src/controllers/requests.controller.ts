import { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2 } from '../utils/r2';
import { prisma } from '../config/db';
import multer from 'multer';
import { uploadToR2, publicUrlForKey } from '../utils/r2';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB per-file limit
});
export const uploadMiddleware = upload.single('file');

export async function createRequest(req: Request, res: Response) {
  const user = (req as any).user;
  const { course, purpose, type } = req.body;
  const r = await prisma.request.create({
    data: { userId: user.id, course, purpose, type, status: 'SUBMITTED' }
  });
  res.json({ request: r });
}

export async function getMyRequest(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;
  const r = await prisma.request.findFirst({ where: { id, userId: user.id } });
  if (!r) return res.status(404).json({ message: 'Not found' });
  res.json({ request: r });
}

export async function getMyRequests(req: Request, res: Response) {
  const user = (req as any).user;
  const requests = await prisma.request.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ requests });
}

export async function getRequestById(req: Request, res: Response) {
  const { id } = req.params;
  const r = await prisma.request.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!r) return res.status(404).json({ message: 'Not found' });
  res.json({ request: r });
}

export async function listAllRequests(req: Request, res: Response) {
  const rs = await prisma.request.findMany({ orderBy: { createdAt: 'desc' }, include: { user: true } });
  res.json({ requests: rs });
}

export async function updateStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // UNDER_REVIEW, APPROVED, REJECTED, COMPLETED
  const r = await prisma.request.update({ where: { id }, data: { status } });
  res.json({ request: r });
}

export async function adminUploadTranscript(req: Request, res: Response) {
  const { id } = req.params;
  const file = (req as any).file as Express.Multer.File;
  if (!file) return res.status(400).json({ message: 'No file' });

  try {
    const key = `transcripts/${id}-${Date.now()}-${file.originalname}`;
    console.log('Uploading file to R2:', { key, size: file.size, mime: file.mimetype });

    await uploadToR2(key, file.buffer, file.mimetype);
    console.log('File uploaded successfully to R2');

    const url = publicUrlForKey(key);
    console.log('Generated public URL:', url);

    if (!url) {
      console.warn('No public URL generated - R2_PUBLIC_BASE_URL may not be configured');
      // Fallback to download endpoint if no public URL
      const downloadUrl = `/api/requests/${id}/download`;
      const updated = await prisma.request.update({
        where: { id },
        data: { transcriptKey: key, transcriptUrl: downloadUrl, fileSize: file.size, status: 'COMPLETED' }
      });
      res.json({ request: updated, url: downloadUrl });
    } else {
      const updated = await prisma.request.update({
        where: { id },
        data: { transcriptKey: key, transcriptUrl: url, fileSize: file.size, status: 'COMPLETED' }
      });
      res.json({ request: updated, url });
    }
  } catch (error) {
    console.error('Error uploading transcript:', error);
    res.status(500).json({ message: 'Failed to upload transcript', error: (error as Error).message });
  }
}

export async function downloadTranscript(req: Request, res: Response) {
  const { id } = req.params;

  try {
    // 1. Check request in DB
    const request = await prisma.request.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!request) return res.status(404).json({ message: "Request not found" });

    // 2. Check permissions
    const user = (req as any).user;
    if (user.role !== "ADMIN" && request.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!request.transcriptKey) {
      return res.status(404).json({ message: "No transcript available" });
    }

    // 3. Fetch file from R2 and serve it directly
    try {
      const cmd = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: request.transcriptKey
      });

      const response = await r2.send(cmd);

      if (!response.Body) {
        return res.status(404).json({ message: "File not found in R2" });
      }

      // Set headers for file download
      res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${request.transcriptKey.split('/').pop()}"`);
      if (response.ContentLength) {
        res.setHeader('Content-Length', response.ContentLength.toString());
      }

      // Stream the file directly to the response
      (response.Body as any).pipe(res);
    } catch (r2Error) {
      console.error('Error fetching from R2:', r2Error);
      return res.status(500).json({ message: "Failed to fetch file from storage" });
    }

  } catch (error) {
    console.error("Error downloading transcript:", error);
    return res.status(500).json({ message: "Failed to download transcript" });
  }
}
