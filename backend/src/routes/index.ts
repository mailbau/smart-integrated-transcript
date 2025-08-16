import { Router } from 'express';
import auth from './auth.routes';
import reqs from './requests.routes';
const r = Router();
r.use('/auth', auth);
r.use('/requests', reqs);
export default r;
