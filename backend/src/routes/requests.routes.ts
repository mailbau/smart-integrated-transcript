import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { createRequest, getMyRequest, getMyRequests, getRequestById, listAllRequests, updateStatus, adminSetSourceLink, userSetExcelLink, verifyTranscript } from '../controllers/requests.controller';

const r = Router();

// student
r.post('/', requireAuth, createRequest);
r.get('/my', requireAuth, getMyRequests);
r.get('/:id', requireAuth, getMyRequest);
// admin
r.get('/', requireAuth, requireAdmin, listAllRequests);
r.get('/admin/:id', requireAuth, requireAdmin, getRequestById);
r.patch('/:id/status', requireAuth, requireAdmin, updateStatus);
r.post('/:id/source-link', requireAuth, requireAdmin, adminSetSourceLink);
r.post('/:id/verify', requireAuth, requireAdmin, verifyTranscript);

// user
r.post('/:id/excel-link', requireAuth, userSetExcelLink);

export default r;
