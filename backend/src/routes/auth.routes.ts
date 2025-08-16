import { Router } from 'express';
import { register, login, me, logout } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', requireAuth, me);
r.post('/logout', requireAuth, logout);
export default r;
