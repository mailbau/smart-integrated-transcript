import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getTemplateLink, setTemplateLink } from '../controllers/settings.controller';

const r = Router();

// Public read
r.get('/template-link', getTemplateLink);

// Admin write
r.post('/template-link', requireAuth, requireAdmin, setTemplateLink);

export default r;
