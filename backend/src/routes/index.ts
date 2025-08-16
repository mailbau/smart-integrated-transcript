import { Router } from 'express';
import auth from './auth.routes';
import reqs from './requests.routes';
import users from './users.routes';

const r = Router();
r.use('/auth', auth);
r.use('/requests', reqs);
r.use('/users', users);

export default r;
