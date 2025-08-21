import { Router } from 'express';
import auth from './auth.routes';
import reqs from './requests.routes';
import users from './users.routes';
import settings from './settings.routes';

const r = Router();
r.use('/auth', auth);
r.use('/requests', reqs);
r.use('/users', users);
r.use('/settings', settings);

export default r;
