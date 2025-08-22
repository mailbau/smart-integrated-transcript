import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { createRequest, getMyRequest, getMyRequests, getRequestById, listAllRequests, updateStatus, adminSetSourceLink, userSetExcelLink, verifyTranscript, userUploadExcel, adminUploadTranscript, downloadTranscript } from '../controllers/requests.controller';

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
r.post('/:id/upload-excel', requireAuth, upload.single('file'), userUploadExcel);
r.get('/:id/download', requireAuth, downloadTranscript);

// admin
r.post('/:id/upload-transcript', requireAuth, requireAdmin, upload.single('file'), adminUploadTranscript);

export default r;
