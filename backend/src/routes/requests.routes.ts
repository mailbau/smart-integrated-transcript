import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { createRequest, getMyRequest, getMyRequests, getRequestById, listAllRequests, updateStatus, adminUploadTranscript, downloadTranscript, uploadMiddleware } from '../controllers/requests.controller';

const r = Router();

// student
r.post('/', requireAuth, createRequest);
r.get('/my', requireAuth, getMyRequests);
r.get('/:id', requireAuth, getMyRequest);
r.get('/:id/download', requireAuth, downloadTranscript);

// admin
r.get('/', requireAuth, requireAdmin, listAllRequests);
r.get('/admin/:id', requireAuth, requireAdmin, getRequestById);
r.patch('/:id/status', requireAuth, requireAdmin, updateStatus);
r.post('/:id/upload', requireAuth, requireAdmin, uploadMiddleware, adminUploadTranscript);

export default r;
