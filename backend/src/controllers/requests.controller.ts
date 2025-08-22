import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { uploadToR2, getDownloadUrl } from '../utils/r2';

// Extend Request type to include file property from multer
interface RequestWithFile extends Request {
  file?: any;
}



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

export async function adminSetSourceLink(req: Request, res: Response) {
  const { id } = req.params;
  const { sourceLink } = req.body as { sourceLink?: string };
  if (!sourceLink) return res.status(400).json({ message: 'sourceLink is required' });
  const updated = await prisma.request.update({
    where: { id },
    data: { sourceLink, status: 'UNDER_REVIEW', underReviewAt: new Date() }
  });
  res.json({ request: updated });
}

export async function userSetExcelLink(req: Request, res: Response) {
  const { id } = req.params;
  const { excelLink } = req.body as { excelLink?: string };
  if (!excelLink) return res.status(400).json({ message: 'excelLink is required' });

  const r = await prisma.request.findUnique({ where: { id } });
  const user = (req as any).user;
  if (!r || r.userId !== user.id) return res.status(404).json({ message: 'Not found' });

  const updated = await prisma.request.update({
    where: { id },
    data: { excelLink, status: 'APPROVED', approvedAt: new Date() }
  });
  res.json({ request: updated });
}

export async function userUploadExcel(req: RequestWithFile, res: Response) {
  const { id } = req.params;
  const user = (req as any).user;

  const r = await prisma.request.findUnique({ where: { id } });
  if (!r || r.userId !== user.id) return res.status(404).json({ message: 'Not found' });

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const key = `excel/${id}-${Date.now()}-${req.file.originalname}`;
    const url = await uploadToR2(key, req.file.buffer, req.file.mimetype);

    const updated = await prisma.request.update({
      where: { id },
      data: {
        excelLink: url,
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

    res.json({ request: updated });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
}

export async function adminUploadTranscript(req: Request, res: Response) {
  const { id } = req.params;

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const key = `transcripts/${id}-${Date.now()}-${req.file.originalname}`;
    const url = await uploadToR2(key, req.file.buffer, req.file.mimetype);

    const updated = await prisma.request.update({
      where: { id },
      data: {
        transcriptKey: key,
        transcriptUrl: url,
        fileSize: req.file.size
      }
    });

    res.json({ request: updated });
  } catch (error) {
    console.error('Transcript upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
}

export async function downloadTranscript(req: Request, res: Response) {
  const { id } = req.params;

  const r = await prisma.request.findUnique({ where: { id } });
  if (!r || !r.transcriptKey) return res.status(404).json({ message: 'Transcript not found' });

  try {
    const downloadUrl = await getDownloadUrl(r.transcriptKey);
    res.json({ downloadUrl });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to generate download URL' });
  }
}

export async function verifyTranscript(req: Request, res: Response) {
  const { id } = req.params;
  const updated = await prisma.request.update({
    where: { id },
    data: { status: 'COMPLETED', completedAt: new Date() }
  });
  res.json({ request: updated });
}

export async function updateStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // UNDER_REVIEW, APPROVED, REJECTED, COMPLETED
  const r = await prisma.request.update({ where: { id }, data: { status } });
  res.json({ request: r });
}


