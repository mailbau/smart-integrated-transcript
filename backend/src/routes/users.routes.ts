import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getAllUsers, getUserById, getUserStats } from '../controllers/users.controller';

const r = Router();

// Admin only routes
r.get('/', requireAuth, requireAdmin, getAllUsers);
r.get('/stats', requireAuth, requireAdmin, getUserStats);
r.get('/:id', requireAuth, requireAdmin, getUserById);

export default r;
